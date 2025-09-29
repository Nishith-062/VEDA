import LiveClass from "../models/liveClass.model.js";
import streamServerClient from "../lib/stream.js";
import Course from "../models/course.model.js";

// 🟢 Teacher: Schedule new class
export const scheduleClass = async (req, res) => {
  try {
    const { title, description, startTime } = req.body;
    const faculty_id = req.user._id;
    const course = await Course.findOne({ faculty_id: faculty_id }).select(
      "_id"
    );
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

    // ensure call exists
    const call = streamServerClient.video.call("livestream", liveClass.streamId);
    await call.getOrCreate({ data: { created_by_id: req.user._id.toString() } });

    // Option A — create a plain user token (no call claims)
    // const token = streamServerClient.createToken(req.user._id.toString());

    // Option B — create a call token (recommended if you want the token to grant access only to this call + a role)
    const token = streamServerClient.generateCallToken({
      user_id: req.user._id.toString(),
      call_cids: [`livestream:${liveClass.streamId}`],
      role: "host",                 // or "admin"/"viewer" depending on your needs
      validity_in_seconds: 60 * 60, // 1 hour
    });

    return res.json({ success: true, token, apiKey: process.env.STREAM_API_KEY, class: liveClass });
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

    // Correct way: use video.call()
    const call = streamServerClient.video.call("livestream", liveClass.streamId);

    // Create a call token for the student (participant role)
    const token = streamServerClient.generateCallToken({
      user_id: req.user._id.toString(),
      call_cids: [`livestream:${liveClass.streamId}`],
      role: "participant",
      validity_in_seconds: 60 * 60, // 1 hour token
    });

    res.json({
      success: true,
      token,
      apiKey: process.env.STREAM_API_KEY,
      class: liveClass,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

