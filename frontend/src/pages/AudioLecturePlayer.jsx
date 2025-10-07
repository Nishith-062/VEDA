import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLectureById } from "../lib/videoDB";
// Import icons from Lucide React
import {
  ChevronLeft,
  Loader2,
  Maximize,
  Minimize,
  Volume2,
  Monitor, // Using a different icon for Current Slide
} from "lucide-react";

// Helper component for a styled section title
const SectionTitle = ({ children }) => (
  <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
    {children}
  </h2>
);

export default function AudioLecturePlayer({ lecture: propLecture }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [lecture, setLecture] = useState(propLecture || null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const audioRef = useRef(null);
  const slideContainerRef = useRef(null);

  const slides = lecture?.slides || [];

  // --- Data Fetching Effect (Unchanged) ---
  useEffect(() => {
    if (!propLecture && id) {
      const fetchLecture = async () => {
        try {
          const localLecture = await getLectureById(id);
          if (localLecture) {
            const audioUrl = URL.createObjectURL(localLecture.audio);
            const slidesWithUrls = (localLecture.slides || []).map((s) => ({
              ...s,
              slideUrl: URL.createObjectURL(s.blob),
            }));
            setLecture({ ...localLecture, audio: audioUrl, slides: slidesWithUrls });
            return;
          }
        } catch (err) {
          console.error("Error fetching lecture:", err);
        }
      };
      fetchLecture();
    }
  }, [id, propLecture]);

  // --- Fullscreen Handler ---
  const toggleFullscreen = useCallback(() => {
    if (!slideContainerRef.current) return;

    if (!document.fullscreenElement) {
      slideContainerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Effect to sync internal state with native fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // --- Audio Time Update Logic (Unchanged) ---
  const handleTimeUpdate = () => {
    if (!audioRef.current || slides.length === 0) return;
    const currentTime = audioRef.current.currentTime;

    let newSlideIndex = currentSlideIndex;
    for (let i = 0; i < slides.length; i++) {
      if (currentTime >= slides[i].startTime) {
        newSlideIndex = i;
      } else {
        break;
      }
    }

    if (newSlideIndex !== currentSlideIndex) {
      setCurrentSlideIndex(newSlideIndex);
    }
  };

  // --- Reset Lecture Effect (Unchanged) ---
  useEffect(() => {
    setCurrentSlideIndex(0);
    if (audioRef.current) audioRef.current.currentTime = 0;
  }, [lecture]);

  // --- Loading State ---
  if (!lecture) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <Loader2 className="w-8 h-8 mr-2 animate-spin text-blue-600" />
      <p className="text-lg text-gray-700">Loading Lecture...</p>
    </div>
  );

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header and Go Back Button */}
      <div className={`flex items-center justify-between mb-6 ${isFullscreen ? 'hidden' : ''}`}>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Go Back
        </button>
        {/* FALLBACK TITLE CLEANED UP: Changed "Audio Lecture" from "Veda Audio Lecture" (if it was there) */}
        <h1 className="text-2xl font-bold text-gray-900 truncate max-w-[60%] sm:max-w-[70%]">
          {lecture.title || "Lecture Player"} 
        </h1>
      </div>

      <div className={`max-w-7xl mx-auto ${isFullscreen ? 'w-screen h-screen max-w-none' : 'grid lg:grid-cols-3 gap-8'}`}>

        {/* Lecture Slides Area */}
        <div
          ref={slideContainerRef}
          className={`relative ${isFullscreen ? 'lg:col-span-3 w-full h-full bg-black flex justify-center items-center' : 'lg:col-span-2 bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200'}`}
        >
          {/* Content Wrapper for standard view */}
          <div className={isFullscreen ? 'hidden' : 'p-6'}>
            <SectionTitle>
              {/* ICON CHANGE: Changed BookOpen to Monitor to remove potential "Veda" association */}
              <Monitor className="inline w-5 h-5 mr-2 text-blue-600" /> 
              Current Slide
            </SectionTitle>
          </div>

          {slides.length > 0 ? (
            <div className={`
              flex justify-center items-center 
              ${isFullscreen 
                ? 'w-full h-full p-2' 
                : 'bg-gray-100 rounded-lg p-2 aspect-video'
              }
            `}>
              <img
                src={slides[currentSlideIndex]?.slideUrl}
                alt={`Slide ${currentSlideIndex + 1}`}
                className={`
                  w-full h-auto object-contain 
                  ${isFullscreen 
                    ? 'max-w-full max-h-full rounded-none' 
                    : 'max-h-[80vh] rounded-md shadow-lg'
                  }
                `}
              />
            </div>
          ) : (
            <div className={`text-center py-10 bg-gray-100 rounded-lg ${isFullscreen ? 'hidden' : ''}`}>
              <p className="text-lg text-gray-500">
                No slides available for this lecture.
              </p>
            </div>
          )}

          {/* ************************************************
            * FULL SCREEN TOGGLE BUTTON           *
            ************************************************
          */}
          <button
            onClick={toggleFullscreen}
            className={`absolute top-4 right-4 p-2 rounded-full transition-colors z-10 
              ${isFullscreen 
                ? 'text-white bg-black bg-opacity-50 hover:bg-opacity-75' 
                : 'text-gray-900 bg-white shadow-lg hover:bg-gray-100'
              }`
            }
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "View Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize className="w-6 h-6 " />
            ) : (
              <Maximize className="w-6 h-6 text-black" />
            )}
          </button>
          {/* ************************************************
            * END FULL SCREEN TOGGLE BUTTON          *
            ************************************************
          */}
        </div>

        {/* Audio Player and Details (Sidebar / Mobile Bottom Section) */}
        <div className={`space-y-6 ${isFullscreen ? 'hidden' : 'lg:col-span-1'}`}>
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
              <p className="italic">{slides[currentSlideIndex]?.title || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}