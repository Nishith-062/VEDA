import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { getLectureById } from "../lib/videoDB";
import {
  ChevronLeft,
  Loader2,
  Maximize,
  Minimize,
  Volume2,
  Monitor,
} from "lucide-react";

const SectionTitle = ({ children }) => (
  <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
    {children}
  </h2>
);

// ✅ Safely create Blob URLs
const makeBlobUrl = (data, type) => {
  if (!data) return null;
  if (data instanceof Blob) return URL.createObjectURL(data);
  if (data instanceof ArrayBuffer || data instanceof Uint8Array)
    return URL.createObjectURL(new Blob([data], { type }));
  if (typeof data === "string" && data.startsWith("blob:")) return data;
  if (typeof data === "string") return data; // already a valid URL
  return null;
};

export default function AudioLecturePlayer({ lecture: propLecture }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [lecture, setLecture] = useState(propLecture || null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef(null);
  const slideContainerRef = useRef(null);

  const slides = lecture?.slides || [];
  const backendUrl = 'http://localhost:3000';

  // 🔥 Try Offline First → Fallback to Online
  useEffect(() => {
    if (!propLecture && id) {
      const fetchLecture = async () => {
        setLoading(true);
        try {
          // --- 1️⃣ Try Offline (IndexedDB)
          const localLecture = await getLectureById(id);
          if (localLecture) {
            console.log("📦 Loaded offline lecture:", localLecture.title);

            const audioUrl = makeBlobUrl(localLecture.audio, "audio/mp3");
            const slidesWithUrls = (localLecture.slides || []).map((s) => ({
              ...s,
              slideUrl: makeBlobUrl(s.blob, "image/png"),
            }));

            setLecture({ ...localLecture, audio: audioUrl, slides: slidesWithUrls });
            setLoading(false);
            return;
          }

          // --- 2️⃣ Fallback to Online Fetch
          console.log("🌐 Fetching lecture from server...");
          const { data } = await axios.get(`${backendUrl}/api/lectures/audio/${id}`);
          const fetchedLecture = data?.data;

          if (fetchedLecture) {
            setLecture({
              ...fetchedLecture,
              audio: fetchedLecture.audio.startsWith("http")
                ? fetchedLecture.audio
                : `${backendUrl}${fetchedLecture.audio}`,
              slides: (fetchedLecture.slides || []).map((s) => ({
                ...s,
                slideUrl: s.slideUrl?.startsWith("http")
                  ? s.slideUrl
                  : `${backendUrl}${s.slideUrl}`,
              })),
            });
          }
        } catch (err) {
          console.error("❌ Error fetching lecture:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchLecture();
    }
  }, [id, propLecture]);

  // --- Fullscreen Handler ---
  const toggleFullscreen = useCallback(() => {
    if (!slideContainerRef.current) return;

    if (!document.fullscreenElement) {
      slideContainerRef.current.requestFullscreen().catch((err) =>
        console.error("Fullscreen error:", err)
      );
    } else {
      document.exitFullscreen();
    }
  }, []);

  // Sync fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // --- Audio time to slide sync ---
  const handleTimeUpdate = () => {
    if (!audioRef.current || slides.length === 0) return;
    const currentTime = audioRef.current.currentTime;

    let newIndex = currentSlideIndex;
    for (let i = 0; i < slides.length; i++) {
      if (currentTime >= slides[i].startTime) newIndex = i;
      else break;
    }

    if (newIndex !== currentSlideIndex) setCurrentSlideIndex(newIndex);
  };

  // Reset when lecture changes
  useEffect(() => {
    setCurrentSlideIndex(0);
    if (audioRef.current) audioRef.current.currentTime = 0;
  }, [lecture]);

  // --- Loading state ---
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 mr-2 animate-spin text-blue-600" />
        <p className="text-lg text-gray-700">Loading Lecture...</p>
      </div>
    );

  if (!lecture)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 text-gray-600">
        Lecture not found (offline + online fetch failed).
      </div>
    );

  // --- Main UI ---
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      {!isFullscreen && (
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Go Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900 truncate max-w-[60%] sm:max-w-[70%]">
            {lecture.title || "Lecture Player"}
          </h1>
        </div>
      )}

      <div
        className={`max-w-7xl mx-auto ${
          isFullscreen
            ? "w-screen h-screen max-w-none"
            : "grid lg:grid-cols-3 gap-8"
        }`}
      >
        {/* Slides Section */}
        <div
          ref={slideContainerRef}
          className={`relative ${
            isFullscreen
              ? "lg:col-span-3 w-full h-full bg-black flex justify-center items-center"
              : "lg:col-span-2 bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200"
          }`}
        >
          {!isFullscreen && (
            <div className="p-6">
              <SectionTitle>
                <Monitor className="inline w-5 h-5 mr-2 text-blue-600" />
                Current Slide
              </SectionTitle>
            </div>
          )}

          {slides.length > 0 ? (
            <div
              className={`flex justify-center items-center ${
                isFullscreen
                  ? "w-full h-full p-2"
                  : "bg-gray-100 rounded-lg p-2 aspect-video"
              }`}
            >
              <img
                src={slides[currentSlideIndex]?.slideUrl}
                alt={`Slide ${currentSlideIndex + 1}`}
                className={`w-full h-auto object-contain ${
                  isFullscreen
                    ? "max-w-full max-h-full rounded-none"
                    : "max-h-[80vh] rounded-md shadow-lg"
                }`}
              />
            </div>
          ) : (
            !isFullscreen && (
              <div className="text-center py-10 bg-gray-100 rounded-lg">
                <p className="text-lg text-gray-500">
                  No slides available for this lecture.
                </p>
              </div>
            )
          )}

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className={`absolute top-4 right-4 p-2 rounded-full transition-colors z-10 ${
              isFullscreen
                ? "text-white bg-black bg-opacity-50 hover:bg-opacity-75"
                : "text-gray-900 bg-white shadow-lg hover:bg-gray-100"
            }`}
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "View Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize className="w-6 h-6" />
            ) : (
              <Maximize className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Audio Section */}
        {!isFullscreen && (
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-200">
              <SectionTitle>
                <Volume2 className="inline w-5 h-5 mr-2 text-blue-600" />
                Audio Player
              </SectionTitle>

              {lecture.audio ? (
                <audio
                  ref={audioRef}
                  controls
                  src={lecture.audio}
                  className="w-full mt-4 rounded-lg"
                  onTimeUpdate={handleTimeUpdate}
                />
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No audio source available.
                </p>
              )}

              <div className="mt-4 pt-4 border-t text-sm text-gray-600">
                <p className="font-medium">Current Slide:</p>
                <p className="text-blue-600 font-semibold">
                  {currentSlideIndex + 1} of {slides.length}
                </p>
                <p className="mt-2 font-medium">Slide Title:</p>
                <p className="italic">
                  {slides[currentSlideIndex]?.title || "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
