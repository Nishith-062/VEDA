import Course from "../models/course.model.js";
import Lecture from "../models/lecture.model.js";
import LectureSlideSyncModel from "../models/LectureSlideSyncModel.js";
import User from "../models/user.model.js";

// ✅ Get all courses in student's department
export const getStudentCourses = async (req, res) => {
  try {
    const studentId = req.user._id; // from auth middleware
    const student = await User.findById(studentId);

    if (!student || student.role !== "Student") {
      return res.status(403).json({ message: "Unauthorized or not a student" });
    }

    // Find all courses in their department
    const courses = await Course.find({
      department_id: student.department_id,
    }).populate("faculty_id", "fullName email");

    res.status(200).json({
      message: "Courses fetched successfully",
      department: student.department_id,
      courses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get all lectures (videos) of a specific course
export const getLecturesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const lectures = await Lecture.find({ course_id: courseId })
      .populate("faculty_id", "fullName email")
      .select("title url duration createdAt");

    if (!lectures.length) {
      return res.status(404).json({ message: "No lectures found for this course" });
    }

    res.status(200).json({
      message: "Lectures fetched successfully",
      count: lectures.length,
      lectures,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAudioCourses = async (req, res) => {
  try {
        const { courseId } = req.params;
        

    const lectures = await LectureSlideSyncModel.find({ course_id: courseId })
      .populate("faculty_id", "fullName email")
      .select("title url duration createdAt");

    if (!lectures.length) {
      return res.status(404).json({ message: "No lectures found for this course" });
    }

    res.status(200).json({
      message: "Lectures fetched successfully",
      count: lectures.length,
      lectures,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
