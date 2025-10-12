import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Video, Upload, PlayCircle, LoaderCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import "../i18n";
import { useAuthStore } from "../store/useAuthStore";
import axios from "axios";
import toast from "react-hot-toast";

export default function TeacherDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const { token } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleFileChange = (e) => setVideoFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) {
      setMessage(t("selectVideoError"));
      return;
    }

    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("video", videoFile);

    try {
      const response = await axios.post(
        "https://veda-bj5v.onrender.com/api/lectures",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`, // if required
          },
        }
      );

      if (response.data.success) {
        setMessage(t("uploadSuccess"));
        setTitle("");
        setVideoFile(null);
      } else {
        setMessage(
          t("uploadFailed", { error: response.data.error || "Unknown error" })
        );
      }
    } catch (error) {
      setMessage(
        t("uploadError", {
          error: error.response?.data?.error || error.message,
        })
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold text-gray-800 flex items-center justify-center gap-3">
            <Video className="w-9 h-9 text-blue-600" />
            {t("teacherDashboard")}
          </h1>
          <p className="mt-3 text-lg text-gray-600">{t("teacherSubtitle")}</p>
        </div>
      </div>
      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        <div className="bg-white border rounded-2xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-xl transition">
          <div className="bg-blue-100 p-6 rounded-full mb-4">
            <Video className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            {t("audioSlideTitle")}
          </h2>
          <p className="text-gray-600 mb-4 text-sm">
            {t("audioSlideDescription")}
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/teacher/slideaudio")}
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white px-5 py-2 rounded-lg font-semibold shadow transition"
            >
              {t("uploadLecture")}
            </button>

            <button
              onClick={() => setIsOpen(true)}
              className="border border-blue-600 text-blue-600 cursor-pointer hover:bg-blue-50 px-5 py-2 rounded-lg font-semibold transition"
            >
              {t("howItWorks")}
            </button>
          </div>
          {isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-white rounded-2xl p-4 max-w-lg mx-4 relative shadow-xl">
                <h3 className="text-xl font-semibold mb-3 text-center">
                  {t("audioSlideTitle")} - {t("howItWorks")}
                </h3>

                <p className="text-gray-700 mb-4 text-center text-sm">
                  {t("audioSlideDescription")}
                  {/* Example translation key: "Upload a lecture audio and sync it with slides so students can follow along while listening." */}
                </p>

                {/* Input explanations */}
                <div className="space-y-2">
                  <div className="bg-gray-50 p-2 rounded-md border-l-4 border-blue-600">
                    <h4 className="font-semibold text-gray-800 text-sm">
                      {t("titleLabel")}
                    </h4>
                    <p className="text-gray-600 text-xs">
                      {t("titleDescription")}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-2 rounded-md border-l-4 border-blue-600">
                    <h4 className="font-semibold text-gray-800 text-sm">
                      {t("audioFileLabel")}
                    </h4>
                    <p className="text-gray-600 text-xs">
                      {t("audioFileDescription")}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-2 rounded-md border-l-4 border-blue-600">
                    <h4 className="font-semibold text-gray-800 text-sm">
                      {t("slidesLabel")}
                    </h4>
                    <p className="text-gray-600 text-xs">
                      {t("slidesDescription")}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-2 rounded-md border-l-4 border-blue-600">
                    <h4 className="font-semibold text-gray-800 text-sm">
                      {t("timestampsLabel")}
                    </h4>
                    <p className="text-gray-600 text-xs">
                      {t("timestampsDescription")}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-2 rounded-md border-l-4 border-blue-600">
                    <h4 className="font-semibold text-gray-800 text-sm">
                      {t("uploadLectureLabel")}
                    </h4>
                    <p className="text-gray-600 text-xs">
                      {t("uploadLectureDescription")}
                    </p>
                  </div>
                </div>

                {/* Close buttons */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-2 right-2 text-red-500 text-xl cursor-pointer hover:text-gray-700 font-bold"
                >
                  ×
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 cursor-pointer rounded-lg mt-4 w-full text-sm"
                >
                  {t("close")}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Upload Video Section */}
          <div className="bg-white border rounded-xl shadow-lg p-8 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Upload className="w-6 h-6 text-blue-500" />
                {t("uploadLecture")}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {t("uploadLectureDesc")}
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                <div>
                  <label className="block mb-2 text-gray-700 font-medium">
                    {t("lectureTitle")}
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder={t("lectureTitlePlaceholder")}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-gray-700 font-medium">
                    {t("videoFile")}
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition cursor-pointer">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileChange}
                      required
                      className="hidden"
                      id="video-upload"
                    />
                    <label
                      htmlFor="video-upload"
                      className="cursor-pointer text-gray-500"
                    >
                      {videoFile ? videoFile.name : t("videoSelectPlaceholder")}
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className={`w-full py-3 rounded-lg font-semibold cursor-pointer text-white shadow transition ${
                    uploading
                      ? "bg-blue-300 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {uploading ? (
                    <span className="inline-flex items-center gap-2 cursor-pointer text-blue-400 font-medium">
                      <LoaderCircle className="w-5 h-5 animate-spin" />
                      {t("uploading")}
                    </span>
                  ) : (
                    t("uploadVideo")
                  )}
                </button>

                {message && (
                  <div
                    className={`mt-4 px-4 py-3 rounded-lg text-sm font-medium text-center ${
                      message.startsWith("✅")
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {message}
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Live Class Section */}
          <div className="bg-white border rounded-xl shadow-lg p-8 flex flex-col justify-center items-center text-center">
            <div className="bg-green-100 p-6 rounded-full mb-6">
              <PlayCircle className="w-14 h-14 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">
              {t("startLiveClass")}
            </h2>
            <p className="mt-2 text-gray-500 text-sm">
              {t("startLiveClassDesc")}
            </p>
            <button
              onClick={() => navigate("/teacher/live")}
              className="mt-8 w-full py-3 cursor-pointer rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold shadow transition"
            >
              {t("goLiveNow")}
            </button>
            {/* <button
            onClick={()=> navigate("/teacher/slideaudio")}
            className="mt-8 w-full py-3 rounded-lg bg-blue-500 hover:bg-blue-700 text-white font-semibold shadow transition"
            >
               Upload Slide + audio lecture
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
}
