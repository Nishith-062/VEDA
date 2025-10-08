import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { PlayCircle, Video as VideoIcon, Download, CheckCircle } from "lucide-react";
import VideoThumbnail from "../components/VideoThumbnail.jsx";
import ThumbnailSkeleton from "../components/ThumbnailSkeleton.jsx";
import { useAuthStore } from "../store/useAuthStore.js";
import { addVideo, getAllVideos, addLecture, getAllLectures } from "../lib/videoDB";
import toast from "react-hot-toast";
import { showNotificationAlert } from "../components/showNotificationAlert.jsx";
import { FetchStudentAudioLectures } from "../components/FetchStudentAudioLectures.jsx";

const backendUrl = "https://veda-bj5v.onrender.com";

export default function Student() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { authUser, token } = useAuthStore();

  const [onlineVideos, setOnlineVideos] = useState([]);
  const [offlineVideos, setOfflineVideos] = useState([]);
  const [offlineLectures, setOfflineLectures] = useState([]);
  const [AudioLectures, setAudioLectures] = useState([]);
  const [AudioLectureloading, setAudioLectureloading] = useState(true);
  const [selectedAudioLecture, setSelectedAudioLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [downloading, setDownloading] = useState({});
  const [downloadedIds, setDownloadedIds] = useState(new Set());

  const createdObjectUrlsRef = useRef(new Set());

  // ------------------- Cleanup object URLs -------------------
  useEffect(() => {
    return () => {
      createdObjectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      createdObjectUrlsRef.current.clear();
    };
  }, []);

  // ------------------- Online/Offline Tracking -------------------
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

  // ------------------- Subscribe to Notifications -------------------
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
      applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY),
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
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    return Uint8Array.from(atob(base64).split("").map((c) => c.charCodeAt(0)));
  }

  // ------------------- Load Videos -------------------
  useEffect(() => {
    async function loadVideos() {
      try {
        let backendVideos = [];
        if (isOnline) {
          const res = await axios.get(`${backendUrl}/api/lectures`);
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

        const dbLectures = await getAllLectures();

        setDownloadedIds(new Set(dbVideos.map((v) => v.id)));
        setOfflineVideos(offlineMapped);
        setOfflineLectures(dbLectures);
        setOnlineVideos(backendVideos);
      } catch (err) {
        console.error("Error fetching videos:", err);
      } finally {
        setLoading(false);
      }
    }

    loadVideos();
  }, [isOnline]);

  // ------------------- Fetch Audio Lectures -------------------
  useEffect(() => {
    const fetchAudioLectures = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/lectures/audio`);
        setAudioLectures(res.data.data || []);
      } catch (e) {
        console.error("Error fetching audio lectures:", e);
      } finally {
        setAudioLectureloading(false);
      }
    };
    fetchAudioLectures();
  }, []);

  // ------------------- Download Online Video -------------------
  async function handleDownload(url, id, title) {
    try {
      setDownloading((prev) => ({ ...prev, [id]: true }));
      const res = await axios.get(url, { responseType: "blob" });
      const videoBlob = res.data;

      const videoFile = { id: id || crypto.randomUUID(), title: title || `video_${id}`, blob: videoBlob };
      await addVideo(videoFile);

      const objUrl = URL.createObjectURL(videoBlob);
      createdObjectUrlsRef.current.add(objUrl);

      setOfflineVideos((prev) => [...prev, { ...videoFile, objectUrl: objUrl }]);
      setDownloadedIds((prev) => new Set(prev).add(videoFile.id));
      toast.success("Video saved offline!");
    } catch (err) {
      console.error("Download failed:", err);
      toast.error("Failed to save video offline.");
    } finally {
      setDownloading((prev) => ({ ...prev, [id]: false }));
    }
  }

  // ------------------- Download Audio Lecture Offline -------------------
  const handleOfflineDownload = async (lecture) => {
    try {
      setDownloading((prev) => ({ ...prev, [lecture._id]: true }));

      // Audio
      const audioUrl = lecture.audio.startsWith("http") ? lecture.audio : `${backendUrl}${lecture.audio}`;
      const audioRes = await axios.get(audioUrl, { responseType: "blob" });

      // Slides
      const slideBlobs = await Promise.all(
        lecture.slides.map(async (slide) => {
          const url = slide.slideUrl.startsWith("http") ? slide.slideUrl : `${backendUrl}${slide.slideUrl}`;
          const res = await axios.get(url, { responseType: "blob" });
          return { blob: res.data, startTime: slide.startTime };
        })
      );

      const lectureObj = { id: lecture._id, title: lecture.title, audio: audioRes.data, slides: slideBlobs };
      await addLecture(lectureObj);
      setOfflineLectures((prev) => [...prev, lectureObj]);
      toast.success("Audio+Slide Lecture saved offline!");
    } catch (err) {
      console.error("Download lecture failed:", err);
      toast.error("Failed to save lecture offline.");
    } finally {
      setDownloading((prev) => ({ ...prev, [lecture._id]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-50 to-white border-b py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-800">{t("studentDashboard")}</h1>
          <p className="mt-2 text-lg text-gray-500">{t("dashboardSubtitle")}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        {/* Live Class */}
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
            className="w-full md:w-auto px-6 py-2 rounded-full bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm transition"
          >
            {t("upcomingLiveClasses")}
          </button>
        </div>

        

        {/* Audio Lectures (Online) */}
        <FetchStudentAudioLectures
  selectedAudioLecture={selectedAudioLecture}
  AudioLectureloading={AudioLectureloading}
  handleOfflineDownload={handleOfflineDownload}
  AudioLectures={AudioLectures}
  offlineLectures={offlineLectures}     // <-- pass offline lectures
  downloading={downloading}             // <-- pass downloading state
/>


        {/* Combined Offline Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              {t("offlineLibrary")}
            </h2>
            <span className="text-sm text-gray-500">
              {t("lectureCount", { count: offlineVideos.length + offlineLectures.length })}
            </span>
          </div>

          {offlineVideos.length === 0 && offlineLectures.length === 0 ? (
            <div className="text-center py-10 bg-white border rounded-2xl shadow-sm">
              <p className="text-sm text-gray-500">{t("noDownloadedLectures")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Offline Videos */}
              {offlineVideos.map((video) => (
                <div key={video.id} className="bg-white border rounded-2xl shadow-sm overflow-hidden flex flex-col">
                  <VideoThumbnail url={video.objectUrl} title={video.title} />
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="font-medium text-gray-800 line-clamp-2 mb-4">{video.title}</h3>
                    <button
                      onClick={() => window.open(video.objectUrl, "_blank")}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-full font-medium shadow-sm transition"
                    >
                      {t("watch")}
                    </button>
                  </div>
                </div>
              ))}

              {/* Offline Audio+Slide Lectures */}
              {offlineLectures.map((lecture) => (
                <div key={lecture.id} className="bg-white border rounded-2xl p-1 shadow-sm flex flex-col">
                  {lecture.slides?.[0] && (
                    <img
                      src={URL.createObjectURL(lecture.slides[0].blob)}
                      alt="First Slide"
                      className="w-full h-40 rounded-lg object-cover"
                    />
                  )}
                  <h3 className="font-medium text-gray-800 mb-2 p-4">{lecture.title}</h3>
                  <div className="flex gap-3 mt-4 px-4">
                    <button
                      onClick={() => navigate(`/student/Audiolecture/${lecture.id}`)}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-full font-medium shadow-sm transition"
                    >
                      Watch
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Online Videos (Only when online) */}
        {isOnline && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <VideoIcon className="w-5 h-5 text-indigo-600" />
                {t("onlineLibrary")}
              </h2>
              <span className="text-sm text-gray-500">{t("lectureCount", { count: onlineVideos.length })}</span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white border rounded-2xl shadow-sm overflow-hidden">
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
                    <div key={video.id} className="bg-white border rounded-2xl shadow-sm overflow-hidden flex flex-col">
                      <VideoThumbnail url={video.url} title={video.title} />
                      <div className="p-5 flex flex-col flex-grow">
                        <h3 className="font-medium text-gray-800 line-clamp-2 mb-4">{video.title}</h3>
                        <div className="mt-auto flex gap-3">
                          <button
                            onClick={() => window.open(video.url, "_blank")}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-full font-medium shadow-sm transition text-center"
                          >
                            {t("watch")}
                          </button>
                          {!isDownloaded && (
                            <button
                              onClick={() => handleDownload(video.url, video.id, video.title)}
                              disabled={downloading[video.id]}
                              className="flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-full font-medium shadow-sm transition"
                            >
                              {downloading[video.id] ? t("downloading") : (
                                <>
                                  <Download className="w-4 h-4" /> {t("download")}
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
