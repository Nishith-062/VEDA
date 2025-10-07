// controllers/videoController.js
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import cloudinary from "../lib/coudinary.js";
import Lecture from "../models/lecture.model.js";
import Course from "../models/course.model.js";
import multer from "multer";
import lectureModel from "../models/LectureSlideSyncModel.js";
import mongoose from "mongoose";
import sharp from "sharp";
import streamifier from "streamifier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === Helper to get video duration ===
const getDuration = (filePath) =>
  new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata.format.duration); // in seconds
    });
  });

// === Video Upload and Compression ===
export const postLectures = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, error: "No file uploaded" });

    const inputPath = req.file.path;
    const fileName = `${Date.now()}_compressed.mp4`;
    const outputDir = path.join(__dirname, "../compressed");
    const outputPath = path.join(outputDir, fileName);

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    ffmpeg(inputPath)
      .outputOptions(["-c:v libx264", "-preset medium", "-crf 32", "-movflags faststart"])
      .save(outputPath)
      .on("end", async () => {
        try {
          const duration = await getDuration(outputPath);

          const result = await cloudinary.uploader.upload(outputPath, {
            resource_type: "video",
          });

          const course = await Course.findOne({ faculty_id: req.user._id }).select("_id course_name");
          if (!course) throw new Error("Course not found for faculty");

          const newLecture = new Lecture({
            faculty_id: req.user._id,
            title: req.body.title,
            originalSize: req.file.size / (1024 * 1024),
            compressedSize: fs.statSync(outputPath).size / (1024 * 1024),
            url: result.secure_url,
            course_id: course._id,
            course_name: course.course_name,
            duration,
          });

          await newLecture.save();

          // Cleanup
          fs.existsSync(outputPath) && fs.unlinkSync(outputPath);
          fs.existsSync(req.file.path) && fs.unlinkSync(req.file.path);

          res.status(200).json({ success: true, url: result.secure_url });
        } catch (err) {
          fs.existsSync(outputPath) && fs.unlinkSync(outputPath);
          fs.existsSync(req.file.path) && fs.unlinkSync(req.file.path);
          res.status(500).json({ success: false, error: err.message });
        }
      })
      .on("error", (err) => {
        fs.existsSync(outputPath) && fs.unlinkSync(outputPath);
        !res.headersSent &&
          res.status(500).json({ success: false, error: "Compression failed: " + err.message });
      });
  } catch (err) {
    console.error(err);
    fs.existsSync(req.file?.path) && fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, error: err.message });
  }
};

// === Fetch All Video Lectures ===
export const getLectures = async (req, res) => {
  try {
    const videos = await Lecture.find();
    res.status(200).json({ success: true, data: videos });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// === Multer Memory Storage for Slides & Audio ===
const storage = multer.memoryStorage();
const upload = multer({ storage });

// === Helper: Upload Buffer to Cloudinary ===
const uploadToCloudinary = (buffer, folder, resourceType = "image") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// === Upload Slides + Audio ===
// === Upload Slides + Audio Controller ===
export const uploadSlide = [
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "slides", maxCount: 50 },
  ]),
  async (req, res) => {
    try {
      const { title, timestamps } = req.body;

      if (!title || !req.files.audio || !req.files.slides || !timestamps)
        return res.status(400).json({ message: "All fields are required" });

      // Parse timestamps and convert MM:SS or H:MM:SS to seconds
      const parsedTimestamps = JSON.parse(timestamps);
      const timeStringToSeconds = (timeStr) => {
        if (typeof timeStr === "number") return timeStr;
        const parts = timeStr.split(":").map(Number);
        if (parts.some(isNaN)) return 0; // fallback
        if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
        if (parts.length === 2) return parts[0] * 60 + parts[1];
        return parts[0];
      };

      const slides = [];

      // Convert slides to WebP and upload
      for (let i = 0; i < req.files.slides.length; i++) {
        const slideFile = req.files.slides[i];
        let webpBuffer;
        try {
          webpBuffer = await sharp(slideFile.buffer).webp({ quality: 80 }).toBuffer();
        } catch (err) {
          console.warn(`Slide ${i + 1} conversion failed, skipping.`, err.message);
          continue; // skip this slide if conversion fails
        }

        const cloudUrl = await uploadToCloudinary(webpBuffer, "veda/slides");
        slides.push({
          slideNumber: i + 1,
          slideUrl: cloudUrl,
          startTime: timeStringToSeconds(parsedTimestamps[i] || 0), // convert to number
        });
      }

      // Upload audio
      const audioFile = req.files.audio[0];
      const audioUrl = await uploadToCloudinary(audioFile.buffer, "veda/audio", "auto");

      // Save lecture to DB
      const lecture = new lectureModel({
        title,
        audio: audioUrl,
        slides,
      });

      await lecture.save();

      res.status(201).json({
        message: "Lecture uploaded successfully",
        data: lecture,
      });
    } catch (err) {
      console.error("🔥 Cloud Upload Error:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },
];


// === Fetch All Audio Lectures ===
export const getAudioLectures = async (req, res) => {
  try {
    const lectures = await lectureModel.find();
    res.status(200).json({ message: "Successfully retrieved audio lectures", data: lectures });
  } catch (err) {
    console.error("🔥 Fetch Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// === Fetch Lecture by ID ===
export const getAudioLecturesById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid lecture ID" });

    const lecture = await lectureModel.findById(id);
    if (!lecture) return res.status(404).json({ message: "Lecture not found" });

    res.status(200).json({ message: "Successfully fetched lecture by ID", data: lecture });
  } catch (err) {
    console.error("🔥 Fetch by ID Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
