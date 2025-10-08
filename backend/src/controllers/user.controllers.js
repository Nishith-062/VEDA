import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import Course from "../models/course.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendVerificationEmail } from "../lib/sendEmail.js";


export const signup = async (req, res) => {
  const { role, fullName, email, password, course_name, description } = req.body;

  if (!role || !fullName || !email || !password)
    return res.status(400).json({ message: "All fields are required" });

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (!existingUser.isVerified) {
        // Email exists but not verified
        return res.status(400).json({ message: "Email already exists but not verified" });
      }
      return res.status(400).json({ message: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = Date.now() + 15 * 60 * 1000; // 15 mins

    const newUser = new User({
      role,
      fullName,
      email,
      password: hashedPassword,
      isVerified: false,
      verificationToken,
      verificationTokenExpires,
    });

    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (err) {
      console.error("Failed to send verification email:", err);
      return res.status(500).json({
        message: "Failed to send verification email. Please check your email address and try again."
      });
    }

    await newUser.save();
    console.log("New user created:", newUser.email);

    if (role === "Teacher" && course_name) {
      const newCourse = new Course({
        faculty_id: newUser._id,
        course_name,
        description: description || "",
      });
      await newCourse.save();
    }

    res.status(201).json({
      message: "Account created! Check your email for verification link.",
    });

  } catch (error) {
    console.error("Error in signup:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isVerified)
      return res
        .status(403)
        .json({ message: "Please verify your email before logging in." });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid credentials" });


    
    // login controller
    const token = await generateToken(user._id,res); // generate token string

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
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
