import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Student from "./pages/Student";
import TeacherPage from "./pages/TeacherPage";
import LoginPage from "./pages/LoginPage";
import TeacherLive from "./pages/TeacherLive";
import StudentLive from "./pages/StudentLive";
import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "./store/useAuthStore";
import { ChevronDown } from "lucide-react";
import Admin from "./pages/Admin";

function App() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  if (isCheckingAuth) return <div>Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left - Logo + Brand */}
            <div className="flex items-center gap-2">
              <img
                src="/logo.jpg"
                alt="VEDA"
                className="h-9 w-9 rounded-md object-cover"
              />
              <span className="text-lg font-semibold text-gray-800">VEDA</span>
            </div>

            {/* Right - User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              {authUser ? (
                <>
                  <button
                    onClick={() => setOpen(!open)}
                    className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-800 text-sm font-medium px-3 py-2 rounded-lg transition"
                  >
                    <span>{authUser.fullName}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 transition-transform ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {open && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-md py-1">
                      <button
                        onClick={() => {
                          useAuthStore.getState().logout();
                          setOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <span className="text-gray-600 text-sm">Not logged in</span>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Routes */}
      <main className="flex-grow">
        <Routes>
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
                <StudentLive />
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
                <TeacherLive />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Default */}
          <Route
            path="*"
            element={<Navigate to={authUser ? "/student" : "/login"} replace />}
          />

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
        </Routes>
      </main>

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
