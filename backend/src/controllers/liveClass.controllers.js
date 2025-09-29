import LiveClass from "../models/liveClass.model.js";
import streamServerClient from "../lib/stream.js";
import Course from "../models/course.model.js";

// 🟢 Teacher: Schedule new class
export const scheduleClass = async (req, res) => {
  try {
    const { title, description, startTime } = req.body;
    const faculty_id = req.user._id;
    console.log(faculty_id);
    
    const course = await Course.findOne({ faculty_id: faculty_id }).select(
      "_id"
    );
    console.log(course);
    if (!course) {
      const newCourse = new Course({
        faculty_id: faculty_id,
        course_name: "Default Course",});
      await newCourse.save();
      // console.log("New course created for faculty:", newCourse);
    }
          
    
    // console.log(course._id); // ✅ logs the id

    // Generate a unique Stream Call ID
    const streamId = `class-${faculty_id}-${Date.now()}`;
    // console.log(streamId);

    const newClass = await LiveClass.create({
      faculty_id,
      course_id:course._id,
      title,
      description,
      startTime,
      streamId,
    });

    res.status(201).json({ success: true, class: newClass });
  } catch (error) {
    
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTeacherClasses = async (req, res) => {
  try {
    const classes = await LiveClass.find({ faculty_id: req.user._id });
    res.json({ success: true, classes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  } }

// 🟢 Teacher: Start class (generate token)
// wherever you export the Stream client (you already have this):
// import streamServerClient from '../lib/streamClient.js'

export const startClass = async (req, res) => {
  try {
    const { id } = req.params;
    const liveClass = await LiveClass.findById(id);
    if (!liveClass) return res.status(404).json({ message: "Class not found" });

    liveClass.status = "live";
    await liveClass.save();

    const call = streamServerClient.video.call("livestream", liveClass.streamId);
    
    // ✅ Create call with proper settings
    await call.getOrCreate({ 
      data: { 
        created_by_id: req.user._id.toString(),
        settings_override: {
          backstage: {
            enabled: true  // Enable backstage if you need it
          }
        }
      } 
    });

    const token = streamServerClient.generateCallToken({
      user_id: req.user._id.toString(),
      call_cids: [`livestream:${liveClass.streamId}`],
      role: "host",
      validity_in_seconds: 60 * 60,
    });

    return res.json({ 
      success: true, 
      token, 
      apiKey: process.env.STREAM_API_KEY, 
      streamId: liveClass.streamId,  // ✅ Also return streamId
      class: liveClass 
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


// 🟢 Teacher: End class
export const endClass = async (req, res) => {
  try {
    const { id } = req.params;
    const liveClass = await LiveClass.findById(id);

    if (!liveClass) return res.status(404).json({ message: "Class not found" });

    liveClass.status = "ended";
    liveClass.endTime = new Date();
    await liveClass.save();

    res.json({ success: true, class: liveClass });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🟢 Student: Get available classes
export const getClasses = async (req, res) => {
  try {
    const classes = await LiveClass.find({
      status: { $in: ["scheduled", "live"] },
    }).populate("faculty_id", "fullName email");

    res.json({ success: true, classes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🟢 Student: Join a class
export const joinClass = async (req, res) => {
  try {
    const { id } = req.params;
    const liveClass = await LiveClass.findById(id);

    if (!liveClass) return res.status(404).json({ message: "Class not found" });
    if (liveClass.status === "scheduled")
      return res.status(403).json({ message: "Class not started yet" });

    const call = streamServerClient.video.call("livestream", liveClass.streamId);
    
    // ✅ Ensure the call exists (don't create it, just verify)
    try {
      await call.get();
    } catch (error) {
      return res.status(404).json({ 
        success: false, 
        message: "Call not started by host yet" 
      });
    }

    const token = streamServerClient.generateCallToken({
      user_id: req.user._id.toString(),
      call_cids: [`livestream:${liveClass.streamId}`],
      role: "viewer",
      validity_in_seconds: 60 * 60,
    });

    res.json({
      success: true,
      token,
      apiKey: process.env.STREAM_API_KEY,
      streamId: liveClass.streamId, // ✅ Add this
      class: liveClass,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

