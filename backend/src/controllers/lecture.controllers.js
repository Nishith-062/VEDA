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
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// helper to get video duration
const getDuration = (filePath) =>
  new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata.format.duration); // in seconds
    });
  });

export const postLectures = async (req, res) => {
  try {
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, error: "No file uploaded" });

    const inputPath = req.file.path;
    const fileName = `${Date.now()}_compressed.mp4`;
    const outputDir = path.join(__dirname, "../compressed");
    const outputPath = path.join(outputDir, fileName);

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    // compress video
    ffmpeg(inputPath)
      .outputOptions([
        "-c:v libx264",
        "-preset medium",
        "-crf 32",
        "-movflags faststart",
      ])
      .save(outputPath)
      .on("end", async () => {
        try {
          // get duration
          const duration = await getDuration(outputPath);

          // upload to Cloudinary
          const result = await cloudinary.uploader.upload(outputPath, {
            resource_type: "video",
          });

          // find course for faculty
          const course = await Course.findOne({
            faculty_id: req.user._id,
          }).select("_id course_name");
          if (!course) {
            throw new Error("Course not found for faculty");
          }

          // save lecture
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

          // cleanup temp files
          fs.unlinkSync(outputPath);
          fs.unlinkSync(req.file.path);

          return res
            .status(200)
            .json({ success: true, url: result.secure_url });
        } catch (err) {
          if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
          if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
          return res.status(500).json({ success: false, error: err.message });
        }
      })
      .on("error", (err) => {
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        if (!res.headersSent)
          return res
            .status(500)
            .json({
              success: false,
              error: "Compression failed: " + err.message,
            });
      });
  } catch (err) {
    console.log(err);
    if (req.file?.path && fs.existsSync(req.file.path))
      fs.unlinkSync(req.file.path);
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getLectures = async (req, res) => {
  try {
    const videos = await Lecture.find();
    // console.log(videos);
    return res.status(200).json({ success: true, data: videos });
  } catch (error) {
    return res.status(400).json({ err: error });
  }
};

// upload lecture video

// Ensure uploads folder exists

// === Multer memory storage (so we don’t save locally) ===
const storage = multer.memoryStorage();
const upload = multer({ storage });

// === Helper: upload buffer to Cloudinary ===
const uploadToCloudinary = (buffer, folder, resourceType = "image") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// === Main Upload Function ===
export const uploadSlide = [
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "slides", maxCount: 50 },
  ]),
  async (req, res) => {
    try {
      const { title, timestamps } = req.body;

      if (!title || !req.files.audio || !req.files.slides || !timestamps) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const parsedTimestamps = JSON.parse(timestamps);
      const slides = [];

      // === Convert and Upload Slides to WebP on Cloudinary ===
      for (let i = 0; i < req.files.slides.length; i++) {
        const slideFile = req.files.slides[i];
        const webpBuffer = await sharp(slideFile.buffer)
          .webp({ quality: 80 })
          .toBuffer();

        const cloudUrl = await uploadToCloudinary(webpBuffer, "veda/slides");
        slides.push({
          slideNumber: i + 1,
          slideUrl: cloudUrl,
          startTime: parsedTimestamps[i] || 0,
        });
      }

      // === Upload Audio File ===
      const audioFile = req.files.audio[0];
      const audioUrl = await uploadToCloudinary(audioFile.buffer, "veda/audio", "auto");

      // === Save Lecture in MongoDB ===
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

// === Fetch All Lectures ===
export const getAudioLectures = async (req, res) => {
  try {
    const lectures = await lectureModel.find();
    return res.status(200).json({
      message: "Successfully retrieved audio lectures",
      data: lectures,
    });
  } catch (err) {
    console.error("🔥 Fetch Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// === Fetch Lecture by ID ===
export const getAudioLecturesById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid lecture ID" });
    }

    const lecture = await lectureModel.findById(id);
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    return res.status(200).json({
      message: "Successfully fetched lecture by ID",
      data: lecture,
    });
  } catch (err) {
    console.error("🔥 Fetch by ID Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};