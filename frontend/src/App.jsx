import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Student from "./pages/Student";
import TeacherPage from "./pages/TeacherPage";
import LoginPage from "./pages/LoginPage";
import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "./store/useAuthStore";
import { ChevronDown, Loader } from "lucide-react";
import Admin from "./pages/Admin";
import { useTranslation } from "react-i18next";
import Languageselector from "./pages/Languageselector";
import Online from "./components/Online";
import Chatbot from "./components/Chatbot";
import BroadCast from "./components/BroadCastLiveStream";
import Viewer from "./components/Viewer";
import StudentLiveClasses from "./pages/StudentLiveClasses";
import TeacherManageClass from "./pages/TeacherManageClass";
import BroadcastPage from "./pages/BroadcastPage";
import ViewerPage from "./pages/ViewerPage";
import Navbar from "./components/navbar";
function App() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { t } = useTranslation();

  useEffect(() => {
    checkAuth();
  }, []);

  // close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <Loader className="animate-spin size-10 text-center" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <Navbar authUser={authUser} />


      {/* Main Routes */}
      <main className="flex-grow">
<Routes>
  {/* Default / Login Redirect */}
  <Route path="/" element={<Navigate to="/login" replace />} />
  <Route
    path="/login"
    element={
      authUser ? (
        authUser.role === "Teacher" ? (
          <Navigate to="/teacher" replace />
        ) : authUser.role === "Admin" ? (
          <Navigate to="/admin" replace />
        ) : authUser.role === "Student" ? (
          <Navigate to="/student" replace />
        ) : (
          <Navigate to="/login" replace />
        )
      ) : (
        <LoginPage />
      )
    }
  />

  {/* Student Routes */}
  <Route
    path="/student"
    element={
      authUser && authUser.role === "Student" ? (
        <Student />
      ) : (
        <Navigate to="/login" replace />
      )
    }
  />
  <Route
    path="/student/live"
    element={
      authUser && authUser.role === "Student" ? (
        <StudentLiveClasses />
      ) : (
        <Navigate to="/login" replace />
      )
    }
  />
  <Route
    path="/student/live-class/:classId"
    element={
      authUser && authUser.role === "Student" ? (
        <ViewerPage />
      ) : (
        <Navigate to="/login" replace />
      )
    }
  />

  {/* Teacher Routes */}
  <Route
    path="/teacher"
    element={
      authUser && authUser.role === "Teacher" ? (
        <TeacherPage />
      ) : (
        <Navigate to="/login" replace />
      )
    }
  />
  <Route
    path="/teacher/live"
    element={
      authUser && authUser.role === "Teacher" ? (
        <TeacherManageClass />
      ) : (
        <Navigate to="/login" replace />
      )
    }
  />
  <Route
    path="/teacher/class/:id/broadcast"
    element={
      authUser && authUser.role === "Teacher" ? (
        <BroadcastPage />
      ) : (
        <Navigate to="/login" replace />
      )
    }
  />

  {/* Admin Routes */}
  <Route
    path="/admin"
    element={
      authUser && authUser.role === "Admin" ? (
        <Admin />
      ) : (
        <Navigate to="/login" replace />
      )
    }
  />

  {/* Wildcard / Fallback */}
  <Route
    path="*"
    element={<Navigate to={authUser ? `/${authUser.role.toLowerCase()}` : "/login"} replace />}
  />
</Routes>

      </main>

      {/* Floating Chatbot */}
      <Chatbot />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} VEDA. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-700 transition">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-gray-700 transition">
              Terms of Service
            </a>
            <a href="#" className="hover:text-gray-700 transition">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
