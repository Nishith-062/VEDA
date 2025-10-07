// routes/videoRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import {
  postLectures,
  getLectures,
  uploadSlide,
  getAudioLectures,
  getAudioLecturesById,
} from "../controllers/lecture.controllers.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// For video uploads
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

const router = express.Router();

// 🎬 Video lecture routes
router.post("/lectures", protectRoute, upload.single("video"), postLectures);
router.get("/lectures", getLectures);

// 🎧 Audio + PDF SlideSync routes
router.post("/lectures/upload", uploadSlide);
router.get("/lectures/audio", getAudioLectures);
router.get("/lectures/audio/:id", getAudioLecturesById);

export default router;
