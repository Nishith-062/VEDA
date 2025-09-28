import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema(
  {
    content_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      default: () => new mongoose.Types.ObjectId(),
    },
    lecture_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Lecture',
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: Number,  // Changed to Number type
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
  }
);

const Content = mongoose.model('Content', contentSchema);

export default Content;
