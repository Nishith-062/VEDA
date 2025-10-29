import mongoose from "mongoose";
const AudioSlideSchema= new mongoose.Schema(
  {
    faculty_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["scheduled", "live", "ended"],
      default: "scheduled",
    },
    streamId: {
      type: String, // ID from Stream.io or your own socket room id
      required: true,
        unique: true,
    },
    slides:[String]
  },
  { timestamps: true }
);

const SlideAudioLiveClass = mongoose.model("SlideAudioLiveClass", AudioSlideSchema);
export default SlideAudioLiveClass;