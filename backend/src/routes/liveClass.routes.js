import express from "express";
import {
  scheduleClass,
  startClass,
  endClass,
  getClasses,
  joinClass,
} from "../controllers/liveClass.controllers.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Teacher routes
router.post("/", protectRoute, scheduleClass);
router.post("/:id/start", protectRoute, startClass);
router.post("/:id/end", protectRoute, endClass);

// Student routes
router.get("/", protectRoute, getClasses);
router.get("/:id/join", protectRoute, joinClass);

export default router;
