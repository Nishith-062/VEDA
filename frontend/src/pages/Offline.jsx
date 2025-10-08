import React, { useEffect, useMemo, useState } from "react";
import { getAllVideos, getAllLectures } from "../lib/videoDB";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

function makeBlobFromStored(blobLike, type = "video/mp4") {
  if (!blobLike) return null;
  if (blobLike instanceof Blob) return blobLike;
  if (typeof blobLike === "string" && blobLike.startsWith("data:")) {
    const arr = blobLike.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], { type: mime || type });
  }
  if (blobLike instanceof ArrayBuffer) return new Blob([blobLike], { type });
  if (ArrayBuffer.isView(blobLike)) return new Blob([blobLike.buffer], { type });
  return null;
}

export default function OfflineDownloads() {
  const [videos, setVideos] = useState([]);
  const [audioLectures, setAudioLectures] = useState([]);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      try {
        const vids = (await getAllVideos()) || [];
        setVideos(vids);
      } catch (err) {
        console.error("❌ Failed to read local videos", err);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const lectures = (await getAllLectures()) || [];
        setAudioLectures(lectures);
      } catch (err) {
        console.error("❌ Failed to read local audio lectures", err);
      }
    })();
  }, []);

  const videoSrcs = useMemo(() => {
    return videos.map((v) => {
      const blob = makeBlobFromStored(v.blob);
      if (!blob) return { id: v.id, url: null, revoke: () => {} };
      const url = URL.createObjectURL(blob);
      return { id: v.id, url, revoke: () => URL.revokeObjectURL(url) };
    });
  }, [videos]);

  useEffect(() => {
    return () => {
      videoSrcs.forEach((v) => v.revoke && v.revoke());
    };
  }, [videoSrcs]);

  const totalCount = videos.length + audioLectures.length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          {t("offlineLibrary")}
        </h1>
        <span className="text-sm text-gray-500">
          {totalCount} {t("lectureCount", { count: totalCount })}
        </span>
      </div>

      {!navigator.onLine && (
        <div className="mb-4 text-yellow-600 text-sm font-medium">
          {t("offlineNotice")}
        </div>
      )}

      {navigator.onLine && (
        <button
          className="bg-blue-600 p-1.5 rounded-sm cursor-pointer text-white mb-4"
          onClick={() => navigate("/login")}
        >
          {t("home") || "Home"}
        </button>
      )}

      {totalCount === 0 ? (
        <p className="text-gray-500 text-center mt-10">
          {t("noOfflineLectures") || "No offline lectures found."}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Offline Videos */}
          {videos.map((video) => {
            const srcObj = videoSrcs.find((s) => s.id === video.id);
            const src = srcObj?.url;
            return (
              <div
                key={video.id}
                className="bg-white border rounded-2xl p-4 shadow-sm flex flex-col"
              >
                <h2 className="font-semibold text-gray-800 line-clamp-2 mb-3">
                  {video.title || t("untitledVideo")}
                </h2>
                {src ? (
                  <video
                    controls
                    className="w-full rounded-lg border border-gray-200"
                    src={src}
                  />
                ) : (
                  <div className="text-sm text-gray-400 mt-2">
                    ⚠️ {t("missingVideoData") || "Missing or invalid video data"}
                  </div>
                )}
              </div>
            );
          })}

          {/* Offline Audio + Slide Lectures */}
          {audioLectures.map((lecture) => (
            <div
              key={lecture.id || lecture._id}
              className="bg-white border rounded-2xl p-4 shadow-sm flex flex-col"
            >
              {lecture.slides?.[0]?.blob && (
                <img
                  src={URL.createObjectURL(lecture.slides[0].blob)}
                  alt="Slide"
                  className="w-full h-40 object-cover rounded-lg mb-3"
                  onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)}
                />
              )}
              <h3 className="font-semibold text-gray-800 line-clamp-2 mb-4">
                {lecture.title || t("untitledLecture")}
              </h3>
              <button
                onClick={() =>
                  navigate(`/student/Audiolecture/${lecture.id || lecture._id}`)
                }
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-full shadow-sm transition"
              >
                {t("listen")}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
