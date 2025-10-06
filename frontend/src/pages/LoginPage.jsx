import React, { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import { useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { HeroSection } from "../components/ComparisonTable.jsx";

const LoginPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const { login, isLoggingIn } = useAuthStore();
  const navigate = useNavigate();

  // Handle online/offline
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const loginAsGuest = async (role) => {
    try {
      if (!isOnline) {
        setMessage(t("noInternet"));
        return;
      }

      let creds = {};
      if (role === "Teacher") creds = { email: "ukchoudhury@gmail.com", password: "123456" };
      else if (role === "Student") creds = { email: "stu@gmail.com", password: "123456" };
      else if (role === "Admin") creds = { email: "veda@gmail.com", password: "admin@123" };

      const user = await login(creds);

      if (!user) {
        setMessage(t("loginFailed"));
        return;
      }

      if (user?.verified === false) {
        setMessage("Your account is not verified. Check your email.");
        return;
      }

      if (user?.role === "Teacher" || role === "Teacher") navigate("/teacher");
      else if (user?.role === "Student" || role === "Student") navigate("/student");
      else if (user?.role === "Admin" || role === "Admin") navigate("/admin");
      else setMessage(t("unknownRole"));
    } catch (error) {
      // console.error(error);
      setMessage(t("loginFailed"));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isOnline) {
      setMessage(t("noInternet"));
      return;
    }
    try {
      const user = await login(formData);

      if (!user) {
        setMessage(t("loginFailed"));
        return;
      }

      if (user?.verified === false) {
        setMessage("Your account is not verified. Check your email.");
        return;
      }

      if (user?.role === "Teacher") navigate("/teacher");
      else if (user?.role === "Student") navigate("/student");
      else if (user?.role === "Admin") navigate("/admin");
      else setMessage(t("unknownRole"));
    } catch (error) {
      // console.error(error);
      setMessage(t("loginFailed"));
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex w-1/2 relative">
        <HeroSection />
      </div>

      <div className="flex w-full lg:w-1/2 justify-center items-center bg-gray-50 px-6">
        <div className="w-full max-w-md space-y-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center">
            {t("welcomeBack")}
          </h2>
          <p className="text-center text-gray-500">
            {t("loginToContinue")} <span className="font-semibold">VEDA</span>
          </p>

          {message && (
            <div className="bg-red-100 text-red-800 p-3 rounded text-center mb-4">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder={t("emailPlaceholder")}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                disabled={!isOnline}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="password"
                placeholder={t("passwordPlaceholder")}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                disabled={!isOnline}
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn || !isOnline}
              className={`w-full py-3 rounded-lg font-semibold text-white transition ${
                isLoggingIn || !isOnline
                  ? "bg-indigo-300 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 shadow-md"
              }`}
            >
              {isLoggingIn ? t("loggingIn") : t("login")}
            </button>

            {/* Guest buttons */}
            {["Student", "Teacher", "Admin"].map((role) => (
              <button
                key={role}
                type="button"
                disabled={isLoggingIn || !isOnline}
                onClick={() => loginAsGuest(role)}
                className={`w-full py-3 rounded-lg font-semibold text-white transition ${
                  isLoggingIn || !isOnline
                    ? "bg-indigo-300 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 shadow-md"
                }`}
              >
                {isLoggingIn ? t("loggingIn") : t(`login${role}Guest`)}
              </button>
            ))}
          </form>

          {!isOnline && (
            <p className="mt-2 text-center text-red-500 font-medium">
              {t("noInternetMessage")}
            </p>
          )}

          <p className="text-center text-sm text-gray-600">
            {t("noAccount")}{" "}
            <a href="/signup" className="text-indigo-600 hover:underline">
              {t("signUp")}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
