import React, { useEffect, useState } from "react";
import { RoomEvent } from 'livekit-client';
import {
  ControlBar,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
  RoomContext,
} from "@livekit/components-react";
import { Room, Track } from "livekit-client";
import "@livekit/components-styles";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  FileText,
  Loader2,
} from "lucide-react";

const BASE_URL = "http://localhost:3000/api/Audioclass-live";

// Component to sync and display slides
function SlideSyncViewer({ slides }) {
  const room = React.useContext(RoomContext);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Listen for teacher's slide updates
  useEffect(() => {
    if (!room) return;

    const handleData = (payload, participant, kind) => {
      try {
        const msg = JSON.parse(new TextDecoder().decode(payload));
        if (msg.type === "slide" && msg.slideIndex !== undefined) {
          setCurrentSlide(msg.slideIndex);
        }
      } catch (err) {
        console.error("Failed to parse slide data:", err);
      }
    };

    room.on(RoomEvent.DataReceived, handleData);

    return () => {
      room.off(RoomEvent.DataReceived, handleData);
    };
  }, [room]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Slide Container */}
      <div
        className={`flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8 ${
          isFullscreen ? "fixed inset-0 z-50 bg-black" : ""
        }`}
      >
        {slides.length > 0 ? (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Slide Image */}
            <div className="relative max-w-full max-h-full flex items-center justify-center">
              <img
                src={slides[currentSlide]}
                alt={`Slide ${currentSlide + 1}`}
                className={`max-w-full max-h-full object-contain rounded-lg shadow-2xl ${
                  isFullscreen ? "" : "border border-slate-200"
                }`}
              />

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-lg shadow-lg transition-all duration-200 hover:scale-110"
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                <Maximize2 className="w-5 h-5 text-slate-700" />
              </button>
            </div>

            {/* Navigation Overlay */}
            <div className="absolute inset-x-0 bottom-8 flex items-center justify-center gap-4 px-4">
              <div className="flex items-center gap-3 bg-white/95 backdrop-blur-sm px-6 py-3 rounded-full shadow-xl border border-slate-200">
                <button
                  onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                  disabled={currentSlide === 0}
                  className="p-2 rounded-full hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                  title="Previous slide"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-700" />
                </button>

                <div className="flex items-center gap-2 px-3">
                  <FileText className="w-4 h-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">
                    {currentSlide + 1} / {slides.length}
                  </span>
                </div>

                <button
                  onClick={() =>
                    setCurrentSlide(
                      Math.min(slides.length - 1, currentSlide + 1)
                    )
                  }
                  disabled={currentSlide === slides.length - 1}
                  className="p-2 rounded-full hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                  title="Next slide"
                >
                  <ChevronRight className="w-5 h-5 text-slate-700" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 text-slate-500">
            <FileText className="w-16 h-16 text-slate-300" />
            <p className="text-lg font-medium">No slides available</p>
            <p className="text-sm text-slate-400">
              Waiting for the presentation to start
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AudioClassViewerpage() {
    const navigate=useNavigate()

  const { token: authToken } = useAuthStore();
  const { id } = useParams();
  const [room] = useState(
    () =>
      new Room({
        adaptiveStream: true,
        dynacast: true,
      })
  );
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [disconnected, setDisconnected] = useState(false);

  // Fetch class details and token
  useEffect(() => {
    if (!authToken) return;

    const fetchData = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/${id}/join`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const { success, token, wsUrl, roomName, class: liveClass } = res.data;
        console.log("✅ Received Token:", token);
        setDetails({ token: String(token), wsUrl, liveClass });
      } catch (err) {
        console.error("Failed to join class:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authToken, id]);

  // Connect and disconnect the LiveKit room
  useEffect(() => {
    if (!details?.token || !details?.wsUrl) return;
    let mounted = true;

    const connectRoom = async () => {
      try {
        if (mounted) {
          await room.connect(details.wsUrl, details.token);
          
          // Handle room disconnection
          const handleDisconnected = () => {
            console.log("Room disconnected by host.");
            setDisconnected(true);
          };
          
          room.on(RoomEvent.Disconnected, handleDisconnected);
        }
      } catch (err) {
        console.error("Error connecting to LiveKit room:", err);
      }
    };

    connectRoom();

    return () => {
      mounted = false;
      room.disconnect();
    };
  }, [room, details]);


  // Check if disconnected
  if (disconnected) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800">
            Class has ended
          </h2>
          <button onClick={()=>navigate('/student')} className="bg-blue-600 text-amber-50 p-2 rounded-2xl hover:bg-blue-800 cursor-pointer">Go to Home</button>
          <p className="text-sm text-slate-500 text-center">
            The host has ended the live session.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-lg font-medium text-slate-700">Loading class...</p>
          <p className="text-sm text-slate-500">
            Please wait while we connect you
          </p>
        </div>
      </div>
    );
  }

  if (!details?.token) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-lg font-semibold text-slate-800">
            Unable to join class
          </p>
          <p className="text-sm text-slate-500 text-center">
            There was an error connecting to the class. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const slides = details.liveClass?.slides || [];

  return (
    <RoomContext.Provider value={room}>
      <div data-lk-theme="default" className="h-screen flex flex-col bg-white">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <h1 className="text-lg sm:text-xl font-semibold text-slate-800">
                {details.liveClass?.title || "Live Class"}
              </h1>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs font-medium text-green-700">Live</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <SlideSyncViewer slides={slides} />
          <RoomAudioRenderer />
        </div>

        {/* Control Bar */}
        <div className="bg-white border-t border-slate-200 shadow-lg">
          <div className="px-4 py-3">
            <ControlBar />
          </div>
        </div>
      </div>
    </RoomContext.Provider>
  );
}