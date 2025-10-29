import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { LoaderCircle } from "lucide-react";

export default function TeacherSlideSync() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [title, setTitle] = useState("");
  const [audio, setAudio] = useState(null);
  const [slides, setSlides] = useState([]);
  const [timestamps, setTimestamps] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!slides || slides.length === 0) return;

    setLoading(true);

    let parsedTimestamps;
    try {
      parsedTimestamps = JSON.parse(timestamps);
      if (!Array.isArray(parsedTimestamps)) {
        throw new Error("Timestamps must be an array");
      }
    } catch (err) {
      toast.error(
        t("invalidTimestamps") ||
          "Invalid timestamps format! Example: [0, 11, '1:08', '1:25']"
      );
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("audio", audio);
    slides.forEach((file) => formData.append("slides", file));
    formData.append("timestamps", JSON.stringify(parsedTimestamps));

    try {
      await axios.post(
        "http://localhost:3000/api/lectures/upload",
        formData
      );
      toast.success(t("uploadSuccess"));
      setTitle("");
      setAudio(null);
      setSlides([]);
      setTimestamps("");
    } catch (err) {
      console.error(err);
      toast.error(t("uploadFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <button
        onClick={() => navigate(-1)}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        {t("goBack") || "Go Back"}
      </button>

      <h1 className="text-3xl font-bold mb-6">{t("uploadLecture")}</h1>

      <div className="bg-white border rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {t("lectureTitle") || "Lecture Details"}
        </h2>

        <form className="space-y-4" onSubmit={handleUpload}>
          {/* Title */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              {t("lectureTitle")}
            </label>
            <input
              type="text"
              placeholder={t("lectureTitlePlaceholder")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          {/* Audio */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              {t("audioFile") || "Audio File"}
            </label>
            <div className="border border-gray-800 rounded-lg p-3">
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setAudio(e.target.files[0])}
                className="w-full"
                required
              />
              {audio && (
                <p className="text-sm mt-2 text-gray-500">
                  {t("selected") || "Selected"}: {audio.name}
                </p>
              )}
            </div>
          </div>

          {/* Slides */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              {t("slides") || "Slides (Select in order)"}
            </label>
            <div className="border border-gray-800 rounded-lg p-3">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) =>
                  setSlides((prev) => [...prev, ...Array.from(e.target.files)])
                }
                className="w-full"
                required
              />
              {slides.length > 0 && (
                <p className="text-sm mt-2 text-gray-500">
                  {slides.length} {t("slidesSelected") || "slides selected"}
                </p>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              {t("timestamps") || "Timestamps"}
            </label>
            <textarea
              placeholder='e.g. [0, 11, "1:08", "1:25"]'
              value={timestamps}
              onChange={(e) => setTimestamps(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          {/* Upload Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white ${
              loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2 text-blue-400 font-medium">
                <LoaderCircle className="w-5 h-5 animate-spin" />
                {t("uploading")}
              </span>
            ) : (
              t("uploadLecture")
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
