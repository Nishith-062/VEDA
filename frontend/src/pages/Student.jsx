import React, { useState, useEffect, useRef } from "react";
import { data, useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import {
  PlayCircle,
  Video as VideoIcon,
  Download,
  CheckCircle,
} from "lucide-react";
import { addVideo, getAllVideos } from "../lib/videoDB";
import VideoThumbnail from "../components/VideoThumbnail.jsx";
import ThumbnailSkeleton from "../components/ThumbnailSkeleton.jsx";
import { useAuthStore } from "../store/useAuthStore.js";
import toast from "react-hot-toast";
// Skeleton loader for thumbnails
import AudioLecturePlayer from "./AudioLecturePlayer.jsx";
import { addLecture } from "../lib/videoDB";
// Skeleton loader for t
// humbnails
const backendUrl = "https://veda-bj5v.onrender.com";

export default function Student() {
  const navigate = useNavigate();
  const { authUser, token } = useAuthStore();
  // separate state for online/offline videos
  const [onlineVideos, setOnlineVideos] = useState([]);
  const [offlineVideos, setOfflineVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [downloading, setDownloading] = useState({});
  const [downloadedIds, setDownloadedIds] = useState(new Set());
  const createdObjectUrlsRef = useRef(new Set());
  const [AudioLectures, setAudioLectures] = useState([]);
  const [AudioLectureloading, setAudioLectureloading] = useState(true);
  const [selectedAudioLecture, setSelectedAudioLecture] = useState(null);
  // Cleanup object URLs
  useEffect(() => {
    return () => {
      createdObjectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      createdObjectUrlsRef.current.clear();
    };
  }, []);

  // Track online/offline state
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
    // Step 1: Ask for notification permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      alert("You need to allow notifications!");
      return;
    }

    // Step 2: Get service worker
    const reg = await navigator.serviceWorker.ready;
    console.log(import.meta.env.VITE_VAPID_PUBLIC_KEY);

    // Step 3: Subscribe to push
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        import.meta.env.VITE_VAPID_PUBLIC_KEY
      ),
    });

    console.log("New subscription:", subscription);

    // Step 4: Send to backend
    await axios.post(
      "https://veda-bj5v.onrender.com/api/notifications/subscribe",
      {
        ...subscription.toJSON(),
        role: "Student", // ✅ match schema enum
        userId: authUser._id,
      },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
  }

  // helper function
  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
  }

  // Load videos
  useEffect(() => {
    async function loadVideos() {
      try {
        let backendVideos = [];
        if (isOnline) {
          const res = await axios.get(
            "https://veda-bj5v.onrender.com/api/lectures"
          );
          backendVideos = (res.data.data || []).map((v) => ({
            id: v._id || v.id,
            title: v.title,
            url: v.url,
          }));
        }

        const dbVideos = await getAllVideos();
        const offlineMapped = dbVideos.map((v) => {
          if (v.blob instanceof Blob) {
            const objUrl = URL.createObjectURL(v.blob);
            createdObjectUrlsRef.current.add(objUrl);
            return { ...v, objectUrl: objUrl };
          }
          return v;
        });

        setDownloadedIds(new Set(dbVideos.map((v) => v.id)));
        setOfflineVideos(offlineMapped);
        setOnlineVideos(backendVideos);
      } catch (err) {
        console.error("Error fetching videos:", err);
      } finally {
        setLoading(false);
      }
    }
    loadVideos();
  }, [isOnline]);

  useEffect(() => {
    // Listen for PWA install prompt (to encourage installation for offline use)
    let deferredPrompt;
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt = e;
      // Show a button or toast to prompt install if desired
    });
  }, []);

  // Download and save offline
  async function handleDownload(url, id, title) {
    try {
      setDownloading((prev) => ({ ...prev, [id]: true }));
      const res = await axios.get(url, { responseType: "blob" });
      const videoBlob = res.data;

      const videoFile = {
        id: id || crypto.randomUUID(),
        title: title || `video_${id}`,
        blob: videoBlob,
      };

      await addVideo(videoFile);

      const objUrl = URL.createObjectURL(videoBlob);
      createdObjectUrlsRef.current.add(objUrl);

      const newOfflineVideo = { ...videoFile, objectUrl: objUrl };
      setOfflineVideos((prev) => [...prev, newOfflineVideo]);
      setDownloadedIds((prev) => new Set(prev).add(videoFile.id));
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading((prev) => ({ ...prev, [id]: false }));
    }
  }
  const { t } = useTranslation();

  // Api Call for AudioLecture
  useEffect(() => {
    const FetchAudioLectures = async () => {
      try {
        const res = await axios.get(
          "https://veda-bj5v.onrender.com/api/lectures/AudioLectures"
        );
        console.log(res.data.message);
        console.log(res.data.data);
        setAudioLectures(res.data.data);
      } catch (e) {
        console.log("Error in Fetching Auion Lectures", e);
      } finally {
        setAudioLectureloading(false);
      }
    };
    FetchAudioLectures();
  }, []);

// handle Offline Download
const handleOfflineDownload=async(lecture)=>{
    try {
    setDownloading((prev) => ({ ...prev, [lecture._id]: true }));

    // 1️⃣ Download audio
    const audioRes = await axios.get(`${backendUrl}${lecture.audio}`, { responseType: "blob" });

    // 2️⃣ Download slides
    const slideBlobs = await Promise.all(
      lecture.slides.map(async (slide) => {
        const res = await axios.get(`${backendUrl}${slide.slideUrl}`, { responseType: "blob" });
        return { blob: res.data, startTime: slide.startTime };
      })
    );

    // 3️⃣ Save lecture offline in IndexedDB
    const lectureObj = {
      id: lecture._id,
      title: lecture.title,
      audio: audioRes.data,
      slides: slideBlobs,
    };

    await addLecture(lectureObj);
    alert("Successfully Saved Audio Lecture Offline")
    // 4️⃣ Update local state for offline use
    // setOfflineVideos((prev) => [...prev, lectureObj]);
    // setDownloadedIds((prev) => new Set(prev).add(lecture._id));
  } catch (err) {
    console.error("Download lecture failed:", err);
  } finally {
    setDownloading((prev) => ({ ...prev, [lecture._id]: false }));
  }
}



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-white border-b py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-800">
            {t("studentDashboard")}
          </h1>
          <p className="mt-2 text-lg text-gray-500">{t("dashboardSubtitle")}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        {/* Live Class */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full">
              <PlayCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {t("liveClass")}
              </h2>
              <p className="text-gray-500 text-sm">
                {t("liveClassDescription")}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/student/live")}
            className="w-full md:w-auto px-6 py-2 rounded-full bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm transition"
          >
            Upcoming Live Classes
          </button>
        </div>
        {/* Audio + SLides Lectures */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-750 flex items-center gap-2">
              <VideoIcon className="w-5 h-5 text-blue-600" />
              Audio+Slide Lectures
            </h2>
            <span></span>
          </div>
          {AudioLectureloading ? (
            <div className="text-center py-10 bg-white border rounded-2xl shadow-sm">
              <p>Loading Audio Lectures</p>
            </div>
          ) : AudioLectures.length == 0 ? (
            <p>No Videos Uploaded</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-3">
              {AudioLectures.map((lecture) => (
                <div
                  key={lecture._id}
                  className="bg-white border rounded-2xl p-1 shadow-sm flex flex-col"
                >
                  {/* First slide of Lecture */}
                  {lecture.slides && lecture.slides.length > 0 && (
                    <img
                      src={`${backendUrl}${lecture.slides[0].slideUrl}`}
                      alt="First Slide"
                      className="w-full h-40 "
                    />
                  )}
                  {console.log(lecture.slides[0].slideUrl)}
                  <h3 className="font-medium text-gray-800 mb-2 p-4">
                    {lecture.title}
                  </h3>

                  {selectedAudioLecture && (
                    <AudioLecturePlayer lecture={selectedAudioLecture} />
                  )}
                  {/* <button 
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                  onClick={()=>setSelectedAudioLecture(lecture)}>Watch</button> */}
                  <div className="flex gap-3 mt-4 px-4">
                    <button
                      onClick={() => navigate(`/student/Audiolecture/${lecture._id}`)}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 m-3 rounded-full font-medium shadow-sm transition"
                    >
                      Watch
                    </button>
                    <button
                      onClick={()=>{handleOfflineDownload(lecture)}
                      }
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 m-3 rounded-full font-medium shadow-sm transition flex items-center justify-center gap-2"
                    
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Downloaded Videos Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              {t("downloadedLibrary")}
            </h2>
            <span className="text-sm text-gray-500">
              {t("lectureCount", { count: offlineVideos.length })}
            </span>
          </div>

          {offlineVideos.length === 0 ? (
            <div className="text-center py-10 bg-white border rounded-2xl shadow-sm">
              <p className="text-sm text-gray-500">
                {t("noDownloadedLectures")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {offlineVideos.map((video) => (
                <div
                  key={video.id}
                  className="bg-white border rounded-2xl shadow-sm overflow-hidden flex flex-col"
                >
                  <VideoThumbnail url={video.objectUrl} title={video.title} />
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="font-medium text-gray-800 line-clamp-2 mb-4">
                      {video.title}
                    </h3>
                    <button
                      onClick={() => window.open(video.objectUrl, "_blank")}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-full font-medium shadow-sm transition"
                    >
                      {t("watch")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Online Videos Section */}
        {isOnline && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <VideoIcon className="w-5 h-5 text-indigo-600" />
                {t("onlineLibrary")}
              </h2>
              <span className="text-sm text-gray-500">
                {t("lectureCount", { count: onlineVideos.length })}
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white border rounded-2xl shadow-sm overflow-hidden"
                  >
                    <ThumbnailSkeleton />
                  </div>
                ))}
              </div>
            ) : onlineVideos.length === 0 ? (
              <div className="text-center py-20 bg-white border rounded-2xl shadow-sm">
                <p className="text-lg text-gray-600">{t("noOnlineLectures")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {onlineVideos.map((video) => {
                  const isDownloaded = downloadedIds.has(video.id);
                  return (
                    <div
                      key={video.id}
                      className="bg-white border rounded-2xl shadow-sm overflow-hidden flex flex-col"
                    >
                      <VideoThumbnail url={video.url} title={video.title} />
                      <div className="p-5 flex flex-col flex-grow">
                        <h3 className="font-medium text-gray-800 line-clamp-2 mb-4">
                          {video.title}
                        </h3>
                        <div className="mt-auto flex gap-3">
                          <button
                            onClick={() => window.open(video.url, "_blank")}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-full font-medium shadow-sm transition text-center"
                          >
                            {t("watch")}
                          </button>
                          {!isDownloaded && (
                            <button
                              onClick={() =>
                                handleDownload(video.url, video.id, video.title)
                              }
                              disabled={downloading[video.id]}
                              className="flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-full font-medium shadow-sm transition"
                            >
                              {downloading[video.id] ? (
                                t("downloading")
                              ) : (
                                <>
                                  <Download className="w-4 h-4" />{" "}
                                  {t("download")}
                                </>
                              )}
                            </button>
                          )}
                          {isDownloaded && (
                            <span className="flex items-center gap-1 text-green-600 bg-green-50 border border-green-200 px-4 py-2 rounded-full text-sm font-medium">
                              <CheckCircle className="w-4 h-4" /> {t("saved")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
