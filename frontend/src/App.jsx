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
import StudentLiveClasses from "./pages/StudentLiveClasses";
import TeacherManageClass from "./pages/TeacherManageClass";
import BroadcastPage from "./pages/BroadcastPage";
import ViewerPage from "./pages/ViewerPage";
import Navbar from "./components/navbar";
import OfflineWatcher from "./components/OfflineWatcher";
import OfflineDownloads from "./pages/Offline";
import SignUp from "./pages/SignUp";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import TeacherSlideSync from "./pages/TeacherSlideSync";
import { Toaster } from "react-hot-toast";
function App() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { t } = useTranslation();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
  const tryInstallPwa = async () => {
    const deferredPrompt = window.__deferredPwaPrompt;
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();

      // Wait for the user choice
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        console.log("PWA installed ✅");
      } else {
        console.log("PWA dismissed ❌");
      }

      // Clear the saved prompt
      window.__deferredPwaPrompt = null;
    }
  };

  // Delay slightly so the page finishes rendering
  const timeout = setTimeout(() => {
    tryInstallPwa();
  }, 1000);

  return () => clearTimeout(timeout);
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
    <div className="flex flex-col items-center justify-center w-full h-screen bg-gray-50 text-gray-800">
      {/* App Logo or Name */}
      <h1 className="text-2xl font-bold mb-4">Welcome to VEDA 🚀</h1>
      
      {/* Loader */}
      <Loader className="animate-spin size-10 text-blue-500 mb-6" />

      {/* Intro Message */}
      <p className="mb-6 text-center max-w-md">
        It may take a moment to load because we are deployed on <b>Vercel</b> and <b>Render</b>.
        In the meantime, here’s why learners ❤️ VEDA:
      </p>

      {/* Quick Feature Highlights */}
      <div className="grid grid-cols-2 gap-4 text-sm max-w-lg">
        <div className="p-3 bg-white rounded shadow text-center">
          🎧 <b>Audio First</b>
          <p>90% less data than video</p>
        </div>
        <div className="p-3 bg-white rounded shadow text-center">
          📶 <b>Adaptive Bitrate</b>
          <p>No buffering on weak networks</p>
        </div>
        <div className="p-3 bg-white rounded shadow text-center">
          📲 <b>PWA Support</b>
          <p>Install like an app</p>
        </div>
        <div className="p-3 bg-white rounded shadow text-center">
          🌐 <b>Hindi UI</b>
          <p>Learn in your own language</p>
        </div>
      </div>

      {/* Small Footer */}
      <p className="mt-6 text-xs text-gray-500">Loading your experience...</p>
    </div>
  );
}


  return (
    <div className="min-h-screen flex flex-col bg-gray-50">


      <Toaster
  position="top-center"
  reverseOrder={false}
/>
      {/* Navbar */}
      <Navbar authUser={authUser} />


      {/* Main Routes */}
      <main className="flex-grow">
          <OfflineWatcher/>

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
    path="/student/live-class/:id"
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
  <Route
    path="/teacher/slideaudio"
    element={
      authUser && authUser.role === "Teacher" ? (
        <TeacherSlideSync />
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

  {/* Inside Student Routes section */}
<Route
  path="/offline-downloads"
  element={
      <OfflineDownloads />
  }
/>


<Route
path="/signup"
element={
  <SignUp/>
}/>

        <Route path="/verify/:token" element={<VerifyEmailPage />} />


<Route 
path="*"
element={
  <OfflineDownloads/>
}/>


</Routes>

      </main>

      {/* Floating Chatbot */}
      {authUser && authUser.role==="Teacher" && <Chatbot />}

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
