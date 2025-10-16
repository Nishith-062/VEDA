import React, { useEffect, useState } from "react";
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
import { useParams } from "react-router-dom";
import axios from "axios";
import { 
  ChevronLeft, 
  ChevronRight, 
  Presentation, 
  Users, 
  Maximize2,
  Minimize2,
  Volume2,
  Clock,
  RotateCw
} from "lucide-react";

const BASE_URL = "http://localhost:3000/api/Audioclass-live";

// Component to display only subscribed audio participants
function TracksView() {
  const tracks = useTracks([{ source: Track.Source.Microphone }], {
    onlySubscribed: true,
  });
  
  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800">Participants</h3>
          <p className="text-xs text-slate-500">{tracks.length} active</p>
        </div>
      </div>
      <GridLayout tracks={tracks} style={{ height: "calc(100% - 80px)" }}>
        <ParticipantTile />
      </GridLayout>
    </div>
  );
}

// Component to sync and display slides
function SlideSyncViewer({ slides }) {
  const room = React.useContext(RoomContext);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [direction, setDirection] = useState('none');

  useEffect(() => {
    if (!room) return;

    const handleMetadataChanged = (participant, metadata) => {
      if (!metadata) return;
      try {
        const data = JSON.parse(metadata);
        if (data.slideIndex !== undefined) {
          setCurrentSlide(data.slideIndex);
        }
      } catch (err) {
        console.error("Failed to parse metadata:", err);
      }
    };

    room.on("participantMetadataChanged", handleMetadataChanged);
    return () => {
      room.off("participantMetadataChanged", handleMetadataChanged);
    };
  }, [room]);

  const goToPrevious = () => {
    if (currentSlide > 0) {
      setDirection('left');
      setTimeout(() => {
        setCurrentSlide(currentSlide - 1);
        setDirection('none');
      }, 150);
    }
  };

  const goToNext = () => {
    if (currentSlide < slides.length - 1) {
      setDirection('right');
      setTimeout(() => {
        setCurrentSlide(currentSlide + 1);
        setDirection('none');
      }, 150);
    }
  };

  const rotateSlide = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const getSlideTransform = () => {
    if (direction === 'left') return 'translateX(-100%)';
    if (direction === 'right') return 'translateX(100%)';
    return 'translateX(0)';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
            <Presentation className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Presentation</h3>
            <p className="text-xs text-slate-500">Live Sync Enabled</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={rotateSlide}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            title="Rotate slide"
          >
            <RotateCw className="w-5 h-5 text-slate-600" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5 text-slate-600" />
            ) : (
              <Maximize2 className="w-5 h-5 text-slate-600" />
            )}
          </button>
        </div>
      </div>

      {/* Slide Display */}
      <div className="flex-grow flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl shadow-2xl overflow-hidden relative group">
        {slides.length > 0 ? (
          <>
            <div 
              className="transition-transform duration-300 ease-out"
              style={{ 
                transform: getSlideTransform(),
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img
                src={slides[currentSlide]}
                alt={`Slide ${currentSlide + 1}`}
                className="max-h-full max-w-full object-contain transition-all duration-500"
                style={{ 
                  transform: `rotate(${rotation}deg)`,
                }}
              />
            </div>
            
            {/* Navigation Arrows */}
            <button
              onClick={goToPrevious}
              disabled={currentSlide === 0}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white hover:scale-110 duration-200"
            >
              <ChevronLeft className="w-6 h-6 text-slate-800" />
            </button>
            
            <button
              onClick={goToNext}
              disabled={currentSlide === slides.length - 1}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white hover:scale-110 duration-200"
            >
              <ChevronRight className="w-6 h-6 text-slate-800" />
            </button>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
                style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
              ></div>
            </div>
          </>
        ) : (
          <div className="text-center">
            <Presentation className="w-16 h-16 text-slate-600 mx-auto mb-3 opacity-50" />
            <p className="text-slate-400">No slides available</p>
          </div>
        )}
      </div>

      {/* Slide Counter */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg">
          <span className="text-white font-semibold text-sm">
            Slide {currentSlide + 1} of {slides.length}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function AudioClassViewerpage() {
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
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

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

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading class...</p>
        </div>
      </div>
    );
  }

  if (!details?.token) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Volume2 className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-slate-700 font-medium">Unable to join class.</p>
          <p className="text-slate-500 text-sm mt-2">Please try again later</p>
        </div>
      </div>
    );
  }

  const slides = details.liveClass?.slides || [];

  return (
    <RoomContext.Provider value={room}>
      <div data-lk-theme="default" className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Header Bar */}
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-[1920px] mx-auto px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Volume2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">
                    {details.liveClass?.title || "Audio Class"}
                  </h1>
                  <p className="text-sm text-slate-500">Live Session</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="w-5 h-5" />
                <span className="font-medium">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Increased slide area */}
        <div className="h-[calc(100vh-88px)] flex gap-4 p-4">
          {/* Left side: Slides - Now takes 80% */}
          <div className="w-4/5 bg-white rounded-2xl shadow-xl p-6">
            <SlideSyncViewer slides={slides} />
          </div>

          {/* Right side: Audio participants - Now takes 20% */}
          <div className="w-1/5 flex flex-col gap-4">
            <div className="flex-grow bg-white rounded-2xl shadow-xl p-4">
              <TracksView />
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-3">
              <RoomAudioRenderer />
              <ControlBar />
            </div>
          </div>
        </div>
      </div>
    </RoomContext.Provider>
  );
}