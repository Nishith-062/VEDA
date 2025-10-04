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

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: true, // allow any origin
  credentials: true,
}));


app.use(express.json());
app.use(cookieParser());

// your routes after cors

app.use("/api/user", userRoutes);
app.use("/api", lectureRoutes);
app.use('/api/live-class',liveRoutes);
app.use('/api/admin',adminRoutes)
app.use('/api/notifications',notificationSubscriptionRoutes)

DbConnect().then(() => {
  app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
  });
});

