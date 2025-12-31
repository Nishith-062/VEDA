import fs from "fs";
import path from "path";
// import { convert } from "pdf-poppler";
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

    if (!pdfFile) {
      return res.status(400).json({ error: "PDF file is required" });
    }

    // Absolute path to uploaded PDF
    const pdfPath = path.resolve(pdfFile.path);

    // 1️⃣ Upload PDF to Cloudinary (PDF → image resource)
    const pdfUpload = await cloudinary.uploader.upload(pdfPath, {
      folder: "audio_slide_class",
      resource_type: "image",
    });

    if (!pdfUpload?.public_id) {
      return res.status(500).json({ error: "Failed to upload PDF" });
    }

    // 2️⃣ Generate slide image URLs (limit to first 10 pages)
    const slideUrls = [];
    const MAX_PAGES = 10;

    for (let page = 1; page <= MAX_PAGES; page++) {
      const slideUrl = cloudinary.url(pdfUpload.public_id, {
        resource_type: "image",
        format: "png",
        page,
        transformation: [{ width: 1024, crop: "scale" }],
      });
      slideUrls.push(slideUrl);
    }

    // 3️⃣ Remove temp PDF from server
    fs.unlinkSync(pdfPath);

    if (!slideUrls.length) {
      return res.status(400).json({ error: "No slides generated" });
    }

    // 4️⃣ Ensure course exists
    let course = await Course.findOne({ faculty_id }).select("_id");
    if (!course) {
      course = await Course.create({
        faculty_id,
        course_name: "Default Course",
      });
    }

    // 5️⃣ Create scheduled live class
    const newClass = await SlideAudioLiveClass.create({
      faculty_id,
      course_id: course._id,
      title,
      startTime: starttime,
      streamId: "stream_" + Date.now(),
      slides: slideUrls,
      status: "scheduled",
    });

    return res.status(201).json({
      success: true,
      class: newClass,
    });
  } catch (err) {
    console.error("Error in scheduleAudioLiveClass:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
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

    const token = await at.toJwt();
    console.log(typeof(token));
    console.log(token);
    
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