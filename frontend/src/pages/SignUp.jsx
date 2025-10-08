import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useTranslation } from "react-i18next";

const SignUp = () => {
  const { t } = useTranslation();
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

    if (formData.role === "Teacher" && !formData.course_name.trim()) {
      setMessage(t("enterCourseName"));
      setIsError(true);
      return;
    }

    try {
      const res = await signup(formData); // call backend

      if (res?.message) {
        setMessage(res.message);
        setIsError(false);
      } else {
        setMessage(t("checkEmailToVerify"));
        setIsError(false);
      }
    } catch (err) {
      console.error(err);

      const backendMessage = err?.response?.data?.message;

      if (backendMessage?.includes("already exists") && backendMessage?.includes("not verified")) {
        setMessage(t("emailExistsNotVerified"));
        setIsError(true);
      } else {
        setMessage(
          backendMessage || t("signupFailed")
        );
        setIsError(true);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">{t("createAccount")}</h2>

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
            <label className="block text-gray-700 mb-1">{t("fullName")}</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder={t("fullNamePlaceholder")}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">{t("email")}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t("emailPlaceholder")}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">{t("password")}</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={t("passwordPlaceholder")}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">{t("role")}</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="Student">{t("student")}</option>
              <option value="Admin">{t("admin")}</option>
              <option value="Teacher">{t("teacher")}</option>
            </select>
          </div>

          {formData.role === "Teacher" && (
            <>
              <div>
                <label className="block text-gray-700 mb-1">{t("courseName")}</label>
                <input
                  type="text"
                  name="course_name"
                  value={formData.course_name}
                  onChange={handleChange}
                  placeholder={t("courseNamePlaceholder")}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">{t("courseDescription")}</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder={t("courseDescriptionPlaceholder")}
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
            {isSigningUp ? t("signingUp") : t("signUp")}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-4">
          {t("alreadyHaveAccount")}{" "}
          <a href="/login" className="text-blue-500 hover:underline">
            {t("logIn")}
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
