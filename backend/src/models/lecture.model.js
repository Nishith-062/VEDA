import mongoose from "mongoose";
import User from "./user.model.js";
import { type } from "os";
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
    },
    course_name:{
      type:String
    },
    duration:{
      type:Number
    }
  },
  { timestamps: true }
);

const Lecture = mongoose.model("Lecture", lectureSchema);

export default Lecture;
