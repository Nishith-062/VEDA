import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import lectureRoutes from './routes/lecture.routes.js'
import DbConnect from "./lib/db.js";
import userRoutes from "./routes/user.routes.js";
import liveRoutes from "./routes/liveClass.routes.js";
import adminRoutes from './routes/admin.routes.js'
import notificationSubscriptionRoutes from './routes/subscribeNotification.routes.js'
import path from 'path'
import audioSlideLive from './routes/slide_audio_liveroutes.js'
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// app.use(cors({
//   origin: true, // allow any origin
//   credentials: true,
// }));

app.use(cors({
  origin: [
    "https://veda-gamma.vercel.app",
    "http://localhost:5173",
        "http://localhost:4173"

  ],
  credentials: true,
}));

// app.use(cors({
//   origin: "http://localhost:5173", // Vite dev server
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: true
// }));

app.use(express.json());
app.use(cookieParser());

// your routes after cors

app.use("/slideuploads", express.static(path.join(process.cwd(), "slideuploads")));
app.use("/api/user", userRoutes);
app.use("/api", lectureRoutes);
app.use('/api/live-class',liveRoutes);
app.use('/api/admin',adminRoutes)
app.use('/api/notifications',notificationSubscriptionRoutes)
app.use('/api/Audioclass-live',audioSlideLive);
DbConnect().then(() => {
  app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
  });
});

