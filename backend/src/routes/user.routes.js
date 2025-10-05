import express from "express";
import { login, logout, signup,checkAuth, verifyEmail} from "../controllers/user.controllers.js"
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup",signup);
router.post("/login",login);
router.post("/logout",logout);

router.get("/check", protectRoute, checkAuth);

router.get("/verify/:token", verifyEmail);


export default router;