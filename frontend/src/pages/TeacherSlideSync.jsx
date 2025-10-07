import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function TeacherSlideSync() {
    const navigate=useNavigate();
  const [title, setTitle] = useState("");
  const [audio, setAudio] = useState(null);
  const [slides, setSlides] = useState([]);
  const [timestamps, setTimestamps] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!slides || slides.length === 0) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("audio", audio);
    slides.forEach((file) => formData.append("slides", file));
    formData.append("timestamps", timestamps);

    try {
      const res = await axios.post(
        "https://veda-bj5v.onrender.com/api/lectures/upload",
        formData
      );
      alert("Lecture uploaded successfully!");
      setTitle("");
      setAudio(null);
      setSlides([]);
      setTimestamps("");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
        <button
      onClick={() => navigate(-1)}
      className="bg-blue-500 text-white px-4 py-2 rounded"
    >
      Go Back
    </button>
      <h1 className="text-3xl font-bold mb-6">Upload Lecture</h1>

      <div className="bg-white border rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Lecture Details</h2>
        <form className="space-y-4" onSubmit={handleUpload}>
          {/* Title */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              placeholder="Lecture Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          {/* Audio */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Audio File
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
                  Selected: {audio.name}
                </p>
              )}
            </div>
          </div>

          {/* Slides */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Slides (Select in order)
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
                  {slides.length} slides selected
                </p>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Timestamps 
            </label>
            <textarea
              placeholder="e.g. [0, 45, 120]"
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
            {loading ? "Uploading..." : "Upload Lecture"}
          </button>
        </form>
      </div>
    </div>
  );
}
