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

export const postLectures = (req, res) => {
  if (!req.file)
    return res.status(400).json({ success: false, error: "No file uploaded" });

  const inputPath = req.file.path;
  const fileName = `${Date.now()}_compressed.mp4`;
  const outputDir = path.join(__dirname, "../compressed");
  const outputPath = path.join(outputDir, fileName);

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  ffmpeg(inputPath)
    .outputOptions(["-c:v libx264", "-preset fast", "-crf 28", "-movflags faststart"])
    .on("end", async () => {
      try {
        const result = await cloudinary.uploader.upload(outputPath, {
          resource_type: "video",
        });


        const course = await Course.findOne({faculty_id:req.user._id}).select("_id course_name");

        const newLecture = await new Lecture({
          faculty_id: req.user._id,
          title: req.body.title,
          originalSize: req.file.size/(1024*1024),
          compressedSize: fs.statSync(outputPath).size/(1024*1024),
          url: result.secure_url,
          course_id: course_id._id,
          course_name: course_id.course_name
        });
        await newLecture.save();

        // Optionally delete temp files
        fs.unlinkSync(outputPath);

        return res.status(200).json({ success: true, url: result.secure_url });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    })
    .on("error", (err) => {
      if (!res.headersSent)
        res.status(500).json({ success: false, error: "Compression failed" });
    })
    .save(outputPath);
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









