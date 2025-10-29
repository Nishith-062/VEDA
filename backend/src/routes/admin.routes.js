import express from "express";
import {
  getDepartments,
  getDepartmentDetails,
  createDepartment,
  createStudent,
  createTeacher,
  createCourse,
  deleteStudent,
  deleteTeacher,
} from "../controllers/admin.controllers.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Department
router.get("/departments", protectRoute, getDepartments);
router.get("/departments/:id", protectRoute, getDepartmentDetails);
router.post("/departments", protectRoute, createDepartment);

// Students
router.post("/students", protectRoute, createStudent);
router.delete("/students/:id", protectRoute, deleteStudent);

// Teachers
router.post("/faculty", protectRoute, createTeacher);
router.delete("/teachers/:id", protectRoute, deleteTeacher);

// Courses
router.post("/courses", protectRoute, createCourse);

export default router;
