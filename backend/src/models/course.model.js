import mongoose from "mongoose";
import User from "./user.model.js";

const courseSchema = new mongoose.Schema(
  {
    faculty_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    course_name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
     students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

const Course = mongoose.model("Course", courseSchema);
export default Course;
