import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" } ,// no unique
  role: { type: String, enum: ["Student", "Teacher", "Admin"] },
  endpoint: { type: String, unique: true }, // unique per device
  keys: {
    p256dh: String,
    auth: String,
  },
});

const Notifications = mongoose.model("Notification", notificationSchema);

export default Notifications;
