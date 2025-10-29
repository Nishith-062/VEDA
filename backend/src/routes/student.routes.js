import express from 'express'
import { protectRoute } from '../middleware/auth.middleware.js';
import { getAudioCourses, getLecturesByCourse, getStudentCourses } from '../controllers/student.controllers.js';

const router=express.Router()

router.get("/courses", protectRoute, getStudentCourses);
router.get("/courses/:courseId/lectures", protectRoute, getLecturesByCourse);
router.get("/audiocourses/:courseId/lectures", protectRoute, getAudioCourses);

export default router;