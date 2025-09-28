import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import lectureRoutes from './routes/lecture.routes.js'
import DbConnect from "./lib/db.js";
import userRoutes from "./routes/user.routes.js";

dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 3000;

console.log("JWT_SECRETKEY:", process.env.JWT_SECRETKEY);

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ["http://localhost:4173", "http://localhost:5173"], // allow both
  credentials: true,
}));

app.use("/api/user", userRoutes);
app.use('/api',lectureRoutes)

DbConnect().then(() => {
  app.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`);
  });
});
