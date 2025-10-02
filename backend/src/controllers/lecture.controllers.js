// controllers/videoController.js
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import cloudinary from "../lib/coudinary.js";
import Lecture from "../models/lecture.model.js";
import Course from "../models/course.model.js";
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
      return res.status(400).json({ success: false, error: "No file uploaded" });

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
          const course = await Course.findOne({ faculty_id: req.user._id }).select(
            "_id course_name"
          );
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

          return res.status(200).json({ success: true, url: result.secure_url });
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
            .json({ success: false, error: "Compression failed: " + err.message });
      });
  } catch (err) {
    console.log(err);
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res.status(500).json({ success: false, error: err.message });
  }
};


export const getLectures=async(req,res)=>{
    try {
        const videos= await Lecture.find()
        // console.log(videos);
        return res.status(200).json({success:true,data:videos})
    } catch (error) {
        return res.status(400).json({err:error})
    }
}









