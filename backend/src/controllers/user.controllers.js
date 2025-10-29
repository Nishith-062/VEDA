import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import Course from "../models/course.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendVerificationEmail } from "../lib/sendEmail.js";
import { log } from "console";

export const signup = async (req, res) => {
  const {
    role,
    fullName,
    email,
    password,
    course_name,
    description,
    department_name,
    department_id,
    college_id,
  } = req.body;

  if (!role || !fullName || !email || !password)
    return res.status(400).json({ message: "All fields are required" });

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (!existingUser.isVerified) {
        return res.status(400).json({
          message:
            "Email already registered. Please verify your account via the link sent to your email.",
        });
      }
      return res.status(400).json({ message: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = Date.now() + 15 * 60 * 1000; // 15 min expiry

    const newUser = new User({
      role,
      fullName,
      email,
      password: hashedPassword,
      isVerified: false,
      verificationToken,
      verificationTokenExpires,
      college_id: college_id || null,
      department_id: department_id || null,
      department_name: department_name || null,
    });

    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (err) {
      console.error("Failed to send verification email:", err);
      return res.status(500).json({
        message:
          "Failed to send verification email. Please try again later.",
      });
    }

    await newUser.save();
    console.log("New user created:", newUser.email);

    // =============== Teacher Flow ===============
    if (role === "Teacher" && course_name) {
      const newCourse = new Course({
        course_name,
        description: description || "",
        faculty_id: newUser._id,
        department_id: department_id || null,
        college_id: college_id || null,
      });
      await newCourse.save();
      console.log("New course created:", newCourse.course_name);
    }

    // =============== Student Flow ===============
    if (role === "Student") {
      if (!department_id || !department_name) {
        return res.status(400).json({
          message:
            "Department ID and department name are required for students.",
        });
      }

      const department = await Department.findById(department_id);
      if (!department)
        return res.status(404).json({ message: "Department not found" });

      department.students.push(newUser._id);
      await department.save();
    }

    res.status(201).json({
      message:
        "Account created! Please verify your email — check your inbox or spam folder.",
    });
  } catch (error) {
    console.error("Error in signup:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const login = async (req, res) => {
  const { email, password } = req.body;
    console.log('Email:', email, 'Password:', password);

  try {
    const user = await User.findOne({ email });
    
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isVerified)
      return res
        .status(403)
        .json({ message: "Please verify your email before logging in." });
    

    // const isPasswordCorrect = await bcrypt.compare(password, user.password);
    // if (!isPasswordCorrect)
    //   return res.status(400).json({ message: "Invalid credentials" });

    // login controller
    const token = await generateToken(user._id, res); // generate token string

    console.log("Cookies:", req.cookies);
    console.log("Headers:", req.headers.cookie);
    res.status(200).json({ user, token }); // return both user and token
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", {
      maxAge: 0,
      httpOnly: true,
      sameSite: "none",
      secure: true,
      path: "/",
    });
    console.log("Cookie after logout:", req.cookies);

    res.status(200).json({ message: "Logged out Successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json({ user: req.user, token: req.cookies.jwt });
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    console.log(token);
    const user = await User.findOne({
      verificationToken: token,
    });
    // console.log(user);

    if(user && user.isVerified){
      return res.status(200).json({message:'Your account is already verified'})
    }
    
    if (!user) {      
      return res.status(400).json({ message: "Invalid or token verified" });
    }

    user.isVerified = true;
    user.verificationTokenExpires = undefined;
    await user.save();
    // console.log(user);
    

    res.status(200).json({ message: "Email verified successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
