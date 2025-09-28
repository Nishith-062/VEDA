import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import lectureRoutes from "./routes/lecture.routes.js";
import DbConnect from "./lib/db.js";
import userRoutes from "./routes/user.routes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  "http://localhost:4173",
  "http://localhost:5173",
  "https://veda-gamma.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow mobile apps / curl
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// your routes after cors

app.use("/api/user", userRoutes);
app.use("/api", lectureRoutes);

DbConnect().then(() => {
  app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
  });
});

