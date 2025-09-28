// src/pages/Teacher.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Video, Upload, PlayCircle } from "lucide-react";

export default function TeacherPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setVideoFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) {
      setMessage("❌ Please select a video file to upload.");
      return;
    }
    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("video", videoFile);

    try {
      const response = await fetch("http://localhost:3000/api/lectures", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const result = await response.json();

      if (response.ok) {
        setMessage("✅ Upload successful!");
        setTitle("");
        setVideoFile(null);
      } else {
        setMessage("❌ Upload failed: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      setMessage("❌ Upload error: " + error.message);
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
            Teacher Dashboard
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Manage your lectures and host live classes seamlessly
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Upload Video Section */}
          <div className="bg-white border rounded-xl shadow-lg p-8 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Upload className="w-6 h-6 text-blue-500" />
                Upload Lecture
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Add new recorded sessions to your library
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                <div>
                  <label className="block mb-2 text-gray-700 font-medium">
                    Lecture Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="Enter lecture title"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-gray-700 font-medium">
                    Video File
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
                      {videoFile ? (
                        <span className="text-gray-700 font-medium">
                          {videoFile.name}
                        </span>
                      ) : (
                        "Click to select or drag & drop your video"
                      )}
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className={`w-full py-3 rounded-lg font-semibold text-white shadow transition ${
                    uploading
                      ? "bg-blue-300 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {uploading ? "Uploading..." : "Upload Video"}
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
              Start a Live Class
            </h2>
            <p className="mt-2 text-gray-500 text-sm">
              Begin an interactive session that students can instantly join
            </p>
            <button
              onClick={() => navigate("/teacher/live")}
              className="mt-8 w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold shadow transition"
            >
              Go Live Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}