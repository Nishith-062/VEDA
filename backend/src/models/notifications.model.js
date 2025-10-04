import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" ,unique:true}, // link to your User model
  role: { type: String, enum: ["Student", "Teacher", "Admin"] },
  endpoint: String,
  keys: {
    p256dh: String,
    auth: String,
  },
});

const Notifications=mongoose.model('notification',notificationSchema)

export default Notifications


