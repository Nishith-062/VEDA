import fs from "fs";
import path from "path";
import { convert } from "pdf-poppler";
import SlideAudioLiveClass from "../models/SlideAudioLivemodel.js";
import Course from "../models/course.model.js";
import cloudinary from "../lib/coudinary.js"; // corrected import
import { Room, RoomServiceClient, AccessToken } from "livekit-server-sdk";

const wsUrl = process.env.LIVEKIT_URL; // e.g. ws://localhost:7880
const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;
export const scheduleAudioLiveClass = async (req, res) => {
  try {
    const { title, starttime } = req.body;
    const pdfFile = req.file;
    const faculty_id = req.user._id;

    if (!pdfFile) return res.status(400).json({ error: "PDF file is required" });

    // Path to uploaded PDF
    const pdfPath = path.resolve(pdfFile.path);

    // Path to temporary folder for slides
    const slidesDir = path.resolve("D:/MainProjects/UpdatedVedaProject/VEDA/backend/src/slides");
    if (!fs.existsSync(slidesDir)) fs.mkdirSync(slidesDir, { recursive: true });

    // Convert PDF to PNG images
    const options = {
      format: "png",
      out_dir: slidesDir,
      out_prefix: "slide",
      scale: 1024,
    };

    await convert(pdfPath, options);

    // Upload images to Cloudinary
    const slideUrls = [];
    const files = fs.readdirSync(slidesDir).filter(f => f.startsWith("slide") && f.endsWith(".png"));

    for (const file of files) {
      const filePath = path.join(slidesDir, file);
      try {
        const uploadResult = await cloudinary.uploader.upload(filePath, {
          folder: "audio_slide_class",
        });
        slideUrls.push(uploadResult.secure_url);
      } catch (err) {
        console.error(`Failed to upload ${file}:`, err);
      }
      fs.unlinkSync(filePath); // delete temp image
    }

    // Delete uploaded PDF
    fs.unlinkSync(pdfPath);

    if (!slideUrls.length) return res.status(400).json({ error: "No slides generated" });

    // Ensure course exists
    let course = await Course.findOne({ faculty_id }).select("_id");
    if (!course) {
      course = await Course.create({ faculty_id, course_name: "Default Course" });
    }

    const newClass = await SlideAudioLiveClass.create({
      faculty_id,
      course_id: course._id,
      title,
      startTime: starttime,
      streamId: "stream_" + Date.now(),
      slides: slideUrls,
    });

    return res.status(201).json({ success: true, class: newClass });
  } catch (err) {
    console.error("Error in scheduleAudioLiveClass:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};


// 
export const getScheduleClasses=async(req,res)=>{
   try{
          const classes = await SlideAudioLiveClass.find({ faculty_id: req.user._id ,status: { $in: ["scheduled", "live"] },});
            res.json({ success: true, classes });
   }catch(error){
       res.status(500).json({ success: false, message: error.message });
   }
}


// get classes

export const getAudioLiveClasses = async (req, res) => {
  try {
    const classes = await SlideAudioLiveClass.find({
      
    }).populate("faculty_id", "fullName email");

    res.json({ success: true, classes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// start class 
export const start=async(req,res)=>{
    try{
       const {id}=req.params;

       const liveclass=await SlideAudioLiveClass.findById(id);
       if(!liveclass) return res.status(404).send({message:"class Not found"});
       liveclass.status="live";
      //  save the class
       await liveclass.save();

      //  create room service
       const roomService = new RoomServiceClient(wsUrl, apiKey, apiSecret);
      
          const opts = {
            name: liveclass.streamId,
            emptyTimeout: 1 * 60, // 10 minutes
            maxParticipants: 20,
          };
           try {
      roomService.createRoom(opts).then((room) => {
        console.log("room created", room);
      });
    } catch (error) {
      if (err.message.includes("already exists")) {
        console.log("Room already exists");
      } else throw err;
    }

     // Generate teacher token
        const at = new AccessToken(apiKey, apiSecret, {
          identity: req.user.fullName.toString(),
        });

// grant permissions
         at.addGrant({
      room: liveclass.streamId,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });

     const token = await at.toJwt();

    return res.json({
      success: true,
      token,
      wsUrl,
      roomName: liveclass.streamId,
      class: liveclass,
    });
    }catch(e){
         res.status(500).json({ success: false, message: e.message });
    }
}


export const end = async (req, res) => {
  try {
    const { id } = req.params;
    const liveClass = await SlideAudioLiveClass.findById(id);

    if (!liveClass) return res.status(404).json({ message: "Class not found" });

    const roomService = new RoomServiceClient(wsUrl, apiKey, apiSecret);

    liveClass.status = "ended";
    liveClass.endTime = new Date();
    await liveClass.save();

    // Delete a room
    roomService.deleteRoom(liveClass.streamId).then(() => {
      console.log("room deleted");
    });

    res.json({ success: true, class: liveClass });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// join
export const joinClass = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Id is",id);
    
    const liveClass = await SlideAudioLiveClass.findById(id);

    if (!liveClass) return res.status(404).json({ message: "Class not found" });
    if (liveClass.status !== "live") {
      return res.status(400).json({ message: "Class is not live yet" });
    }

    // Generate viewer token
    const at = new AccessToken(apiKey, apiSecret, {
      identity: req.user.fullName.toString(),
    });

    // grant permissions (view only)
    at.addGrant({
      room: liveClass.streamId,
      roomJoin: true,
      canPublish: false,
      canSubscribe: true,
    });

    const token = at.toJwt();

    return res.json({
      success: true,
      token,
      wsUrl,
      roomName: liveClass.streamId,
      class: liveClass,
    });
  } catch (e) {
    console.error("Error joining class:", e);
    res.status(500).json({ success: false, message: e.message });
  }
};
