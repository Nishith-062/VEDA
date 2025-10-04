import express from "express";
import Notifications from "../models/notifications.model.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import webpush from "../lib/webpush.js";

const router = express.Router();

// Subscribe to notifications
router.post("/subscribe", async (req, res) => {
  try {
    const { userId, role, endpoint, keys } = req.body;

    // Check if endpoint already exists
    const existing = await Notifications.findOne({ endpoint });
    if (!existing) {
      const subscription = new Notifications({ userId, role, endpoint, keys });
      await subscription.save();
    }

    return res.status(200).json({ message: "Subscribed successfully" });
  } catch (error) {
    console.error("❌ Subscribe error:", error);
    return res.status(500).json({
      message: "Not able to subscribe notifications",
      error: error.message,
    });
  }
});

// Send notification to all subscribers
router.post("/notify", protectRoute, async (req, res) => {
  try {
    const subscriptions = await Notifications.find();
    const payload = JSON.stringify({
      title: "Live Class Started 🎥",
      body: `Your teacher ${req.user.fullName} has started a live class`,
    });

    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: sub.keys },
            payload
          );
          console.log("✅ Push sent to:", sub.endpoint);
        } catch (err) {
          console.error("❌ Push failed:", err);

          // Remove dead subscriptions (410 Gone or 404 Not Found)
          if (err.statusCode === 410 || err.statusCode === 404) {
            await Notifications.deleteOne({ _id: sub._id });
          }
        }
      })
    );

    res.json({ message: "Notifications sent!" });
  } catch (err) {
    console.error("❌ Notify route error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
