import React, { useState, useEffect } from "react";
import {
  LiveKitRoom,
  useTracks,
  ControlBar,
  GridLayout,
  ParticipantTile,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "@livekit/components-styles";
import { useAuthStore } from "../store/useAuthStore";
import {
  ChevronLeft,
  ChevronRight,
  Presentation,
  Users,
  Radio,
  LogOut,
  Play,
  Pause,
  RotateCw,
  Maximize2,
  Eye,
  Activity,
  Clock,
  Share2
} from "lucide-react";

const BASE_URL = "http://localhost:3000/api/Audioclass-live";

// Show only subscribed audio participants (teacher microphone)
const TracksView = () => {
  const tracks = useTracks([{ source: Track.Source.Microphone }], {
    onlySubscribed: true,
  });

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800">Participants</h3>
          <p className="text-xs text-slate-500">{tracks.length} listening</p>
        </div>
      </div>
      <GridLayout
        tracks={tracks}
        style={{ height: "calc(100% - 80px)" }}
      >
        <ParticipantTile />
      </GridLayout>
    </div>
  );
};

const AudioBroadcastPage = () => {
  const { token } = useAuthStore();
  const { id } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [isPresenting, setIsPresenting] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [startTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate session duration
  const getSessionDuration = () => {
    const diff = Math.floor((currentTime - startTime) / 1000);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Fetch LiveKit token + class details
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const res = await axios.post(
          `${BASE_URL}/start/${id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDetails(res.data);
      } catch (err) {
        console.error("Error starting class:", err);
        alert("Failed to start class");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, token]);

  // Handle class disconnect/end
  const handleDisconnect = async () => {
    const confirmEnd = window.confirm("Are you sure you want to end this class? All students will be disconnected.");
    if (!confirmEnd) return;

    try {
      await axios.post(
        `${BASE_URL}/${id}/end`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/teacher");
    } catch (err) {
      console.error("Error ending class:", err);
    }
  };

  const slides = details?.class?.slides || [];

  const changeSlide = (newIndex) => {
    if (newIndex < 0 || newIndex >= slides.length) return;
    setCurrentSlide(newIndex);
    if (room?.localParticipant) {
      room.localParticipant.setMetadata(
        JSON.stringify({ slideIndex: newIndex, role: "teacher" })
      );
    }
  };

  const rotateSlide = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleKeyPress = (e) => {
    if (e.key === "ArrowLeft") changeSlide(currentSlide - 1);
    if (e.key === "ArrowRight") changeSlide(currentSlide + 1);
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentSlide, slides.length]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700 font-semibold text-lg">Starting your class...</p>
          <p className="text-slate-500 text-sm mt-2">Connecting to LiveKit server</p>
        </div>
      </div>
    );
  }

  if (!details?.token) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Radio className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-slate-700 font-bold text-lg">Unable to start class</p>
          <p className="text-slate-500 text-sm mt-2">Please try again or contact support</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-[1920px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Class Info */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg animate-pulse">
                <Radio className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  {details.class?.title || "Audio Class"}
                  <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full animate-pulse flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    LIVE
                  </span>
                </h1>
                <p className="text-sm text-slate-500">Teacher Broadcast Mode</p>
              </div>
            </div>

            {/* Center: Session Stats */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg">
                <Clock className="w-4 h-4 text-slate-600" />
                <span className="text-sm font-mono font-semibold text-slate-700">
                  {getSessionDuration()}
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-lg">
                <Eye className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-700">
                  {room?.remoteParticipants?.size || 0} Students
                </span>
              </div>
            </div>

            {/* Right: Actions */}
            <button
              onClick={handleDisconnect}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              End Class
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="h-[calc(100vh-88px)] flex gap-4 p-4">
        {/* Left: Slide Control Panel */}
        <div className="w-4/5 bg-white rounded-2xl shadow-xl p-6 flex flex-col">
          {/* Slide Controls Header */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                <Presentation className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Presentation Control</h3>
                <p className="text-xs text-slate-500">Use arrow keys or buttons to navigate</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={rotateSlide}
                className="p-2.5 rounded-lg hover:bg-slate-100 transition-colors group"
                title="Rotate slide"
              >
                <RotateCw className="w-5 h-5 text-slate-600 group-hover:rotate-90 transition-transform duration-300" />
              </button>
              <button
                onClick={() => setIsPresenting(!isPresenting)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg transition-all"
              >
                {isPresenting ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPresenting ? "Pause" : "Resume"}
              </button>
            </div>
          </div>

          {/* Slide Display */}
          <div className="flex-grow flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl shadow-2xl overflow-hidden relative group">
            {slides.length > 0 ? (
              <>
                <img
                  src={slides[currentSlide]}
                  alt={`Slide ${currentSlide + 1}`}
                  className="max-h-full max-w-full object-contain transition-all duration-500"
                  style={{ transform: `rotate(${rotation}deg)` }}
                />
                
                {/* Slide Number Indicator */}
                <div className="absolute top-4 right-4 px-4 py-2 bg-black/60 backdrop-blur-md rounded-lg">
                  <span className="text-white font-mono font-semibold">
                    {currentSlide + 1} / {slides.length}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-700">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-300"
                    style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
                  ></div>
                </div>
              </>
            ) : (
              <div className="text-center">
                <Presentation className="w-20 h-20 text-slate-600 mx-auto mb-4 opacity-50" />
                <p className="text-slate-400 text-lg">No slides uploaded</p>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => changeSlide(currentSlide - 1)}
              disabled={currentSlide === 0}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            <div className="flex items-center gap-3">
              <div className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                <span className="text-white font-bold text-lg">
                  Slide {currentSlide + 1} of {slides.length}
                </span>
              </div>
            </div>

            <button
              onClick={() => changeSlide(currentSlide + 1)}
              disabled={currentSlide === slides.length - 1}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right: Audio Control Panel */}
        <div className="w-1/5 flex flex-col gap-4">
          <div className="flex-grow bg-white rounded-2xl shadow-xl p-4">
            <LiveKitRoom
              audio
              token={details.token}
              serverUrl={details.wsUrl}
              data-lk-theme="default"
              onDisconnected={handleDisconnect}
              onConnected={(connectedRoom) => setRoom(connectedRoom)}
              className="h-full"
            >
              <TracksView />
              <div className="mt-4">
                <ControlBar />
              </div>
            </LiveKitRoom>
          </div>

          {/* Quick Info Panel */}
          <div className="bg-white rounded-2xl shadow-xl p-4">
            <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Quick Tips
            </h4>
            <div className="space-y-2 text-xs text-slate-600">
              <p className="flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center font-mono">←</span>
                Previous slide
              </p>
              <p className="flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center font-mono">→</span>
                Next slide
              </p>
              <p className="flex items-center gap-2">
                <RotateCw className="w-4 h-4" />
                Rotate slide
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioBroadcastPage;