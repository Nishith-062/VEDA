import express from "express";
import { getScheduleClasses, scheduleAudioLiveClass,getAudioLiveClasses, start ,end,joinClass} from "../controllers/SlideAudioLivecontroller.js";


import multer from "multer";
import { protectRoute } from "../middleware/auth.middleware.js";

const upload = multer({ dest: "uploads/" }); 
const router = express.Router();

// Use upload.single('pdf') to parse the file
router.post("/", upload.single("pdf"),protectRoute, scheduleAudioLiveClass);
router.get('/',protectRoute,getScheduleClasses)
router.post('/start/:id',protectRoute,start)
router.post('/:id/end',protectRoute,end)


// student Route
router.get("/scheduleAudio",protectRoute,getAudioLiveClasses);
router.get("/:id/join", protectRoute, joinClass);

export default router;
