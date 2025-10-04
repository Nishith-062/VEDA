import dotenv from "dotenv";
import webpush from "web-push";
dotenv.config();

console.log(process.env.VAPID_PRIVATE_KEY);

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export default webpush