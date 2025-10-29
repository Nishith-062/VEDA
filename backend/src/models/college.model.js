import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: String,
    address: String,
    managers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Admins
    teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Faculty
    departments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Department" }],
  },
  { timestamps: true }
);

const College = mongoose.model("College", collegeSchema);
export default College;
