import mongoose from "mongoose";

const slideSchema = new mongoose.Schema({
  slideNumber: { type: Number, required: true },
  slideUrl: { type: String, required: true },
  startTime: { type: Number, required: true },
});

const lectureSchema = new mongoose.Schema({
  title: { type: String, required: true },
  faculty_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  originalSize: {
    type: Number,
    required: true,
  },
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  course_name: {
    type: String,
  },
  duration: {
    type: Number,
  },
  audio: { type: String, required: true },
  slides: [slideSchema], // must match backend 'slides'
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model(
  "Slide_AudioLecture",
  lectureSchema,
  "myLecturesCollection"
);
