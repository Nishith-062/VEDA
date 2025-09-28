import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['Teacher', 'Student','Admin'], // allowed values
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true, // optional: removes whitespace
      lowercase: true // optional: stores email in lowercase
    },
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
