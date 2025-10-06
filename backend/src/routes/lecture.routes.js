// routes/videoRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { getLectures, postLectures } from "../controllers/lecture.controllers.js";
import { getLectures, getSlideLectures, postLectures, uploadSlide } from "../controllers/lecture.controllers.js";
import { protectRoute } from "../middleware/auth.middleware.js";
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });
const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Route for uploading & compressing
router.post('/lectures',protectRoute,upload.single("video"),postLectures)
router.get('/lectures',getLectures)
router.post('/lectures/upload',uploadSlide)
router.get('/Audiolectures',getSlideLectures)

export default router