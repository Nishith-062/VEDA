import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";

const SignUp = () => {
  const { signup, isSigningUp } = useAuthStore();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "Student",
    course_name: "",
    description: "",
  });

  const [message, setMessage] = useState(""); // success/error
  const [isError, setIsError] = useState(false); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "role" && value !== "Teacher" ? { course_name: "", description: "" } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    // Teacher must provide course_name
    if (formData.role === "Teacher" && !formData.course_name.trim()) {
      setMessage("Please enter your course name.");
      setIsError(true);
      return;
    }

    try {
      const res = await signup(formData); // call backend

      if (res?.message) {
        setMessage(res.message);
        setIsError(false);
      } else {
        setMessage("Account created! Check your email to verify your account.");
        setIsError(false);
      }
    } catch (err) {
      console.error(err);

      const backendMessage = err?.response?.data?.message;

      if (backendMessage?.includes("already exists") && backendMessage?.includes("not verified")) {
        setMessage(
          "Email exists but not verified. Please check your inbox and verify your email."
        );
        setIsError(true);
      } else {
        setMessage(
          backendMessage || "Signup failed. Please check your email address or try again."
        );
        setIsError(true);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>

        {message && (
          <div
            className={`p-3 rounded mb-4 text-center ${
              isError ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@mail.com"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="Student">Student</option>
              <option value="Admin">Admin</option>
              <option value="Teacher">Teacher</option>
            </select>
          </div>

          {formData.role === "Teacher" && (
            <>
              <div>
                <label className="block text-gray-700 mb-1">Course Name</label>
                <input
                  type="text"
                  name="course_name"
                  value={formData.course_name}
                  onChange={handleChange}
                  placeholder="Enter your course name"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Course Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Optional description"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className={`w-full py-2 rounded-lg font-semibold transition-colors ${
              isSigningUp
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
            disabled={isSigningUp}
          >
            {isSigningUp ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500 hover:underline">
            Log In
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
