import express from 'express'
import User from '../models/user.model.js'

const router=express.Router()

router.get('/student-info',async(req,res)=>{
    try {
        const result=await User.find({role:'Student'})
        return res.status(200).json({data:result})
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message })
    }
})
router.get('/teacher-info',async (req,res) => {
     try {
     const teachers = await User.aggregate([
      {
        $match: { role: "Teacher" }
      },
      {
        $lookup: {
          from: "lectures",
          localField: "_id",
          foreignField: "faculty_id",
          as: "lectures"
        }
      },
      {
        $lookup: {
          from: "liveclasses",
          localField: "_id",
          foreignField: "faculty_id",
          as: "liveClasses"
        }
      },
      {
        $project: {
          fullName: 1,
          email: 1,
          lecturesCount: { $size: "$lectures" },
          liveClassesCount: { $size: "$liveClasses" }
        }
      }
    ]);

    res.status(200).json({ success: true, data: teachers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
})
export default router