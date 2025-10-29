import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["Teacher", "Student", "Admin"],
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    // 🟢 New fields
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null,
    },
    verificationTokenExpires: Date,
    college_id: { type: mongoose.Schema.Types.ObjectId, ref: "College" },
    department_id: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    department_name: String, // redundant field for faster query
  },

  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
