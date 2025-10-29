import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { PlayCircle, Video as VideoIcon } from "lucide-react";
import ThumbnailSkeleton from "../components/ThumbnailSkeleton.jsx";
import { useAuthStore } from "../store/useAuthStore.js";
import toast from "react-hot-toast";
import { showNotificationAlert } from "../components/showNotificationAlert.jsx";
import CourseCard from "../components/studentComponents/CourseCard.jsx"; // ✅ your card

const backendUrl = "http://localhost:3000";

export default function Student() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { authUser, token } = useAuthStore();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const createdObjectUrlsRef = useRef(new Set());




  useEffect(() => {
    return () => {
      createdObjectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      createdObjectUrlsRef.current.clear();
    };
  }, []);

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

  useEffect(() => {
    if (authUser?.role === "Student" && token) {
      (async () => {
        try {
          await subscribeToNotifications(authUser, token);
        } catch (err) {
          console.error("Notification subscription failed:", err);
        }
      })();
    }
  }, [authUser, token]);

  async function subscribeToNotifications(authUser, token) {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return showNotificationAlert();

    const reg = await navigator.serviceWorker.ready;
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        import.meta.env.VITE_VAPID_PUBLIC_KEY
      ),
    });

    await axios.post(
      `${backendUrl}/api/notifications/subscribe`,
      {
        ...subscription.toJSON(),
        role: "Student",
        userId: authUser._id,
      },
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );
  }

  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    return Uint8Array.from(
      atob(base64)
        .split("")
        .map((c) => c.charCodeAt(0))
    );
  }

  useEffect(() => {
    async function loadCourses() {
      setLoading(true);
      try {
        if (isOnline) {
          const res = await axios.get(`${backendUrl}/api/students/courses`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          setCourses(res.data.courses || []);
                  console.log(res.data.courses);

        }
        
      } catch (err) {
        console.error("Error fetching courses:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, [isOnline]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-indigo-50 to-white py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-800">{t("studentDashboard")}</h1>
          <p className="mt-2 text-lg text-gray-500">{t("dashboardSubtitle")}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        <div className="bg-white rounded-2xl shadow-sm border p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full">
              <PlayCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{t("liveClass")}</h2>
              <p className="text-gray-500 text-sm">{t("liveClassDescription")}</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/student/live")}
            className="w-full md:w-auto px-6 py-2 cursor-pointer rounded-full bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm transition"
          >
            {t("upcomingLiveClasses")}
          </button>
        </div>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <VideoIcon className="w-5 h-5 text-indigo-600" />
            Your Courses
          </h2>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 3 }).map((_, idx) => <ThumbnailSkeleton key={idx} />)
            ) : courses.length > 0 ? (
              courses.map((course,i) => (
                <div key={course._id} className='flex justify-center'>
                <CourseCard
                  key={course._id}
                  courseId={course._id}
                  title={course.course_name}
                  description={course.description}
                  instructor={course.faculty_id.fullName || "Instructor"}
                />
                </div>
              ))
            ) : (
              <div>No courses available</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
