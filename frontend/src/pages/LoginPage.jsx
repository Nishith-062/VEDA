// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import { useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const { login, isLoggingIn } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(formData);
      if (user?.role === "Teacher") navigate("/teacher");
      else if (user?.role === "Student") navigate("/student");
      else setMessage("Unknown role ❌");
    } catch (error) {
      console.error(error);
      setMessage("Login failed ❌");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Image/Branding */}
      <div className="hidden lg:flex w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Education background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex flex-col justify-center items-center text-center px-10 text-white">
          <h1 className="text-4xl font-extrabold">Virtual Education Delivery Assistant</h1>
          <p className="mt-4 text-lg text-indigo-100">
            Learn, teach, and collaborate in one seamless platform.
          </p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex w-full lg:w-1/2 justify-center items-center bg-gray-50 px-6">
        <div className="w-full max-w-md space-y-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center">Welcome Back</h2>
          <p className="text-center text-gray-500">Login to continue to <span className="font-semibold">VEDA</span></p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className={`w-full py-3 rounded-lg font-semibold text-white transition ${
                isLoggingIn
                  ? "bg-indigo-300 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 shadow-md"
              }`}
            >
              {isLoggingIn ? "Logging in..." : "Login"}
            </button>
          </form>

          {message && (
            <p className="mt-2 text-center text-red-500 font-medium">{message}</p>
          )}

          <p className="text-center text-sm text-gray-600">
            Don’t have an account?{" "}
            <a href="/signup" className="text-indigo-600 hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;