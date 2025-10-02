import LiveClass from "../models/liveClass.model.js";
import Course from "../models/course.model.js";
import { Room, RoomServiceClient, AccessToken } from "livekit-server-sdk";

const wsUrl = process.env.LIVEKIT_URL; // e.g. ws://localhost:7880
const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;

// 🟢 Teacher: Schedule new class
export const scheduleClass = async (req, res) => {
  try {
    const { title, description, startTime } = req.body;
    const faculty_id = req.user._id;

    let course = await Course.findOne({ faculty_id }).select("_id");
    if (!course) {
      course = await Course.create({
        faculty_id,
        course_name: "Default Course",
      });
    }

    const roomName = `class-${faculty_id}-${Date.now()}`;

    const newClass = await LiveClass.create({
      faculty_id,
      course_id: course._id,
      title,
      description,
      startTime,
      streamId: roomName, // use as roomName
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
  }
};

// 🟢 Teacher: Start class
export const startClass = async (req, res) => {
  try {
    console.log('World');
    
    const { id } = req.params;
    const liveClass = await LiveClass.findById(id);
    if (!liveClass) return res.status(404).json({ message: "Class not found" });

    liveClass.status = "live";
    await liveClass.save();

    const roomService = new RoomServiceClient(wsUrl, apiKey, apiSecret);

    const opts = {
      name: liveClass.streamId,
      emptyTimeout: 1 * 60, // 10 minutes
      maxParticipants: 20,
    };

    try {
      roomService.createRoom(opts).then((room) => {
        console.log('asfo');
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

    at.addGrant({
      room: liveClass.streamId,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });

    const token = await at.toJwt();

    return res.json({
      success: true,
      token,
      wsUrl,
      roomName: liveClass.streamId,
      class: liveClass,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🟢 Teacher: End class
export const endClass = async (req, res) => {
  try {
    const { id } = req.params;
    const liveClass = await LiveClass.findById(id);

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

// 🟢 Student: Join class
export const joinClass = async (req, res) => {
  try {
    const { id } = req.params;
    const liveClass = await LiveClass.findById(id);

    if (!liveClass) return res.status(404).json({ message: "Class not found" });
    if (liveClass.status === "scheduled") {
      return res.status(403).json({ message: "Class not started yet" });
    }

    // Generate viewer token (subscribe only)
    const at = new AccessToken(apiKey, apiSecret, {
      identity: req.user.fullName.toString(),
    });

    at.addGrant({
      room: liveClass.streamId,
      roomJoin: true,
      canPublish: false, // viewers cannot publish
      canPublishData:true,
      canSubscribe: true,
    });

    const token = await at.toJwt();

    res.json({
      success: true,
      token,
      wsUrl,
      roomName: liveClass.streamId,
      class: liveClass,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
