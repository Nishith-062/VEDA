import mongoose from "mongoose";
import User from "./user.model.js";
const lectureSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    faculty_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    url:{
        type:String,
        required:true
    },
    originalSize:{
        type:Number,
        required:true},
    compressedSize:{
        type:Number,
        required:true}
    ,course_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
    }
  },
  { timestamps: true }
);

const Lecture = mongoose.model("Lecture", lectureSchema);

export default Lecture;
