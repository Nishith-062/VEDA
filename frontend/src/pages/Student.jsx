import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  PlayCircle,
  Video as VideoIcon,
  Download,
  CheckCircle,
} from "lucide-react";
import { addVideo, getAllVideos } from "../lib/videoDB";

// Skeleton loader for thumbnails
function ThumbnailSkeleton() {
  return <div className="w-full h-44 bg-gray-200 animate-pulse rounded-t-lg" />;
}

// Generate thumbnails dynamically
function VideoThumbnail({ url, title }) {
  const [thumb, setThumb] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const video = document.createElement("video");
    video.src = url;
    video.crossOrigin = "anonymous";
    video.currentTime = 2;

    video.onloadeddata = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      setThumb(canvas.toDataURL("image/png"));
      setLoading(false);
    };
  }, [url]);

  if (loading) return <ThumbnailSkeleton />;
  return (
    <img
      src={thumb}
      alt={title}
      className="w-full h-44 object-cover rounded-t-lg"
    />
  );
}

export default function Student() {
  const navigate = useNavigate();
  // separate state for online/offline videos
  const [onlineVideos, setOnlineVideos] = useState([]);
  const [offlineVideos, setOfflineVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [downloading, setDownloading] = useState({});
  const [downloadedIds, setDownloadedIds] = useState(new Set());
  const createdObjectUrlsRef = useRef(new Set());

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

  // Load videos
  useEffect(() => {
    async function loadVideos() {
      try {
        let backendVideos = [];
        if (isOnline) {
          const res = await axios.get("https://veda-bj5v.onrender.com/api/lectures");
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Offline Banner */}
      {!isOnline && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-md z-50">
          ⚠ Offline Mode: Showing only downloaded videos
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-white border-b py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-800">Student Dashboard</h1>
          <p className="mt-2 text-lg text-gray-500">
            Join live classes and access your lecture library
          </p>
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
              <h2 className="text-lg font-semibold text-gray-800">Live Class</h2>
              <p className="text-gray-500 text-sm">
                Join instantly if your teacher has started a session
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/student/live")}
            className="w-full md:w-auto px-6 py-2 rounded-full bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm transition"
          >
            Join Now
          </button>
        </div>

        {/* Downloaded Videos Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Downloaded Library (Offline)
            </h2>
            <span className="text-sm text-gray-500">
              {offlineVideos.length} lecture
              {offlineVideos.length !== 1 ? "s" : ""}
            </span>
          </div>

          {offlineVideos.length === 0 ? (
            <div className="text-center py-10 bg-white border rounded-2xl shadow-sm">
              <p className="text-sm text-gray-500">No downloaded lectures yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {offlineVideos.map((video) => {
                const src = video.objectUrl;
                return (
                  <div
                    key={video.id}
                    className="bg-white border rounded-2xl shadow-sm overflow-hidden flex flex-col"
                  >
                    <VideoThumbnail url={src} title={video.title} />
                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="font-medium text-gray-800 line-clamp-2 mb-4">
                        {video.title}
                      </h3>
                      <button
                        onClick={() => window.open(src, "_blank")}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-full font-medium shadow-sm transition"
                      >
                        Watch
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Online Videos Section */}
        {isOnline && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <VideoIcon className="w-5 h-5 text-indigo-600" />
                Online Library
              </h2>
              <span className="text-sm text-gray-500">
                {onlineVideos.length} lecture
                {onlineVideos.length !== 1 ? "s" : ""}
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
                    <div className="p-5">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
                      <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : onlineVideos.length === 0 ? (
              <div className="text-center py-20 bg-white border rounded-2xl shadow-sm">
                <p className="text-lg text-gray-600">
                  📂 No online lectures available
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {onlineVideos.map((video) => {
                  const src = video.url;
                  const isDownloaded = downloadedIds.has(video.id);
                  return (
                    <div
                      key={video.id}
                      className="bg-white border rounded-2xl shadow-sm overflow-hidden flex flex-col"
                    >
                      <VideoThumbnail url={src} title={video.title} />
                      <div className="p-5 flex flex-col flex-grow">
                        <h3 className="font-medium text-gray-800 line-clamp-2 mb-4">
                          {video.title}
                        </h3>
                        <div className="mt-auto flex gap-3">
                          <button
                            onClick={() => window.open(src, "_blank")}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-full font-medium shadow-sm transition text-center"
                          >
                            Watch
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
                                <span className="flex items-center gap-2">
                                  <svg
                                    className="animate-spin h-4 w-4 text-gray-600"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a12 12 0 00-12 12h4z"
                                    ></path>
                                  </svg>
                                  Downloading...
                                </span>
                              ) : (
                                <>
                                  <Download className="w-4 h-4" />
                                  <span>Download</span>
                                </>
                              )}
                            </button>
                          )}
                          {isDownloaded && (
                            <span className="flex items-center gap-1 text-green-600 bg-green-50 border border-green-200 px-4 py-2 rounded-full text-sm font-medium">
                              <CheckCircle className="w-4 h-4" /> Saved
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
