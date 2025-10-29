import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/user.model.js";
import College from "./models/college.model.js";
import Department from "./models/department.model.js";
import Course from "./models/course.model.js";
import Lecture from "./models/lecture.model.js";
import SlideAudioLecture from "./models/LectureSlideSyncModel.js"; // change name if different
import LiveClass from "./models/liveClass.model.js";
import Notifications from "./models/notifications.model.js";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://nishithcbit_db_user:6d3VtWyllfhR5eM5@cluster0.8uadp3n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

// --- Seed Function ---
const seedData = async () => {
  try {
    console.log("🌱 Clearing old data...");
    await Promise.all([
      User.deleteMany({}),
      College.deleteMany({}),
      Department.deleteMany({}),
      Course.deleteMany({}),
      Lecture.deleteMany({}),
      SlideAudioLecture.deleteMany({}),
      LiveClass.deleteMany({}),
      Notifications.deleteMany({}),
    ]);

    console.log("🧑‍🎓 Inserting seed data...");

    // ----- COLLEGE -----
    const college = await College.create({
      name: "TechVille Institute of Technology",
      description: "A top engineering college focusing on AI and Web3 innovation.",
      address: "Hyderabad, India",
    });

    // ----- USERS -----
    const admin = await User.create({
      role: "Admin",
      email: "admin@techville.edu",
      fullName: "Dr. Ramesh Kumar",
      password: "admin123",
      isVerified: true,
      college_id: college._id,
    });

    const teacher1 = await User.create({
      role: "Teacher",
      email: "jane@techville.edu",
      fullName: "Jane Doe",
      password: "teacher123",
      isVerified: true,
      college_id: college._id,
    });

    const teacher2 = await User.create({
      role: "Teacher",
      email: "rahul@techville.edu",
      fullName: "Rahul Sharma",
      password: "teacher123",
      isVerified: true,
      college_id: college._id,
    });

    const student1 = await User.create({
      role: "Student",
      email: "student1@techville.edu",
      fullName: "Arjun Patel",
      password: "student123",
      isVerified: true,
      college_id: college._id,
    });

    const student2 = await User.create({
      role: "Student",
      email: "student2@techville.edu",
      fullName: "Priya Mehta",
      password: "student123",
      isVerified: true,
      college_id: college._id,
    });

    // ----- DEPARTMENT -----
    const csDept = await Department.create({
      name: "Computer Science and Engineering",
      description: "Focuses on AI, ML, and Full Stack Development.",
      college_id: college._id,
      faculty: [teacher1._id, teacher2._id],
      students: [student1._id, student2._id],
    });

    // Update users with department_id
    await Promise.all([
      User.updateMany({ _id: { $in: [teacher1._id, teacher2._id] } }, { department_id: csDept._id, department_name: csDept.name }),
      User.updateMany({ _id: { $in: [student1._id, student2._id] } }, { department_id: csDept._id, department_name: csDept.name }),
    ]);

    // ----- COURSES -----
    const course1 = await Course.create({
      faculty_id: teacher1._id,
      college_id: college._id,
      department_id: csDept._id,
      course_name: "Introduction to Machine Learning",
      description: "Covers fundamentals of supervised and unsupervised learning.",
    });

    const course2 = await Course.create({
      faculty_id: teacher2._id,
      college_id: college._id,
      department_id: csDept._id,
      course_name: "Web Development with MERN",
      description: "Learn how to build modern web apps using MongoDB, Express, React, and Node.",
    });

    // ----- LECTURES -----
    const lecture1 = await Lecture.create({
      title: "Linear Regression Basics",
      faculty_id: teacher1._id,
      url: "https://example.com/ml/linear-regression.mp4",
      originalSize: 120,
      compressedSize: 80,
      course_id: course1._id,
      course_name: course1.course_name,
      duration: 45,
    });

    const lecture2 = await Lecture.create({
      title: "React Fundamentals",
      faculty_id: teacher2._id,
      url: "https://example.com/webdev/react-basics.mp4",
      originalSize: 150,
      compressedSize: 90,
      course_id: course2._id,
      course_name: course2.course_name,
      duration: 60,
    });

    // ----- SLIDE + AUDIO LECTURES -----
    const slideAudioLecture = await SlideAudioLecture.create({
      title: "Deep Learning Overview",
      faculty_id: teacher1._id,
      course_id: course1._id,
      course_name: course1.course_name,
      originalSize: 200,
      duration: 50,
      audio: "https://example.com/audio/deep-learning.mp3",
      slides: [
        { slideNumber: 1, slideUrl: "https://example.com/slides/slide1.png", startTime: 0 },
        { slideNumber: 2, slideUrl: "https://example.com/slides/slide2.png", startTime: 30 },
      ],
    });

    // ----- LIVE CLASSES -----
    const liveClass = await LiveClass.create({
      faculty_id: teacher2._id,
      course_id: course2._id,
      title: "Live React State Management Session",
      description: "Interactive class on React state and context API.",
      startTime: new Date(Date.now() + 3600000),
      endTime: new Date(Date.now() + 7200000),
      streamId: "stream123",
      status: "scheduled",
    });

    // ----- NOTIFICATIONS -----
    await Notifications.create([
      {
        userId: student1._id,
        role: "Student",
        endpoint: "endpoint1",
        keys: { p256dh: "key1", auth: "auth1" },
      },
      {
        userId: teacher1._id,
        role: "Teacher",
        endpoint: "endpoint2",
        keys: { p256dh: "key2", auth: "auth2" },
      },
    ]);

    // ----- UPDATE COLLEGE -----
    college.managers = [admin._id];
    college.teachers = [teacher1._id, teacher2._id];
    college.departments = [csDept._id];
    await college.save();

    console.log("✅ Seeding completed successfully!");
    process.exit();
  } catch (error) {
    console.error("❌ Error while seeding:", error);
    process.exit(1);
  }
};

// --- Run ---
await connectDB();
await seedData();
