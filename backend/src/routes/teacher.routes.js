// // routes/videoRoutes.js
// import express from "express";
// import multer from "multer";
// import path from "path";
// import { fileURLToPath } from "url";
// import {
//   postLectures,
//   getLectures,
//   uploadSlide,
//   getAudioLectures,
//   getAudioLecturesById,
// } from "../controllers/lecture.controllers.js";
// import { protectRoute } from "../middleware/auth.middleware.js";
// import {
//   scheduleClass,
//   startClass,
//   endClass,
//   getClasses,
//   joinClass,
//   getTeacherClasses,
// } from "../controllers/liveClass.controllers.js";

// // Student routes
// router.get("/schedule", protectRoute, getClasses);
// router.get("/:id/join", protectRoute, joinClass);

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // For video uploads
// const storage = multer.diskStorage({
//   destination: "./uploads",
//   filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
// });
// const upload = multer({ storage });

// const router = express.Router();

// // 🎬 Video lecture routes
// router.post("/lectures", protectRoute, upload.single("video"), postLectures);
// router.get("/lectures", getLectures);

// // 🎧 Audio + PDF SlideSync routes
// router.post("/lectures/upload", uploadSlide);
// router.get("/lectures/audio", getAudioLectures);
// router.get("/lectures/audio/:id", getAudioLecturesById);


// // Teacher routes
// router.get("/", protectRoute, getTeacherClasses);
// router.post("/", protectRoute, scheduleClass);
// router.post("/:id/start", protectRoute, startClass);
// router.post("/:id/end", protectRoute, endClass);


// export default router;
