import express from "express";
import Notifications from "../models/notifications.model.js"; // ✅ add .js
import { protectRoute } from "../middleware/auth.middleware.js";
import webpush from "../lib/webpush.js";

const router = express.Router();

router.post("/subscribe", async (req, res) => {
  try {
    const existing = await Notifications.findOne({
      endpoint: req.body.endpoint,
    });
    if (!existing) {
      const subscription = new Notifications(req.body);
      await subscription.save();
    }

    return res.status(200).json({ message: "Subscribed successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Not able to subscribe notifications",
      error: error.message, // ✅ return only the message
    });
  }
});

router.post("/notify", protectRoute, async (req, res) => {
  try {
    console.log("notification sent");

    const subscriptions = await Notifications.find();
    const payload = JSON.stringify({
      title: "Live Class Started 🎥",
      body: `Your teacher ${req.user.fullName} has started a live class`,
    });
    console.log("subsriptions");
    console.log(subscriptions);

    // send to all students
    await Promise.all(
      subscriptions.map((sub) =>
        webpush
          .sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.keys.p256dh,
                auth: sub.keys.auth,
              },
            },
            payload
          )
          .then(() => console.log("✅ Push sent to:", sub.endpoint))
          .catch((err) => console.error("❌ Push failed:", err))
      )
    );

    res.json({ message: "Notifications sent!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router; // ✅ don't forget to export the router
