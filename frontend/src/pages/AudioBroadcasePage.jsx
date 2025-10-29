import React, { useState, useEffect } from "react";
import {
  LiveKitRoom,
  useTracks,
  GridLayout,
  ParticipantTile,
  useRoomContext,
} from "@livekit/components-react";
import { Track, RoomEvent, DataPacket_Kind } from "livekit-client";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "@livekit/components-styles";
import { useAuthStore } from "../store/useAuthStore";
import { 
  Mic, 
  MicOff, 
  PhoneOff, 
  ChevronLeft, 
  ChevronRight,
  Maximize2,
  Users,
  Clock
} from "lucide-react";

const BASE_URL = "http://localhost:3000/api/Audioclass-live";

// Enhanced Control Buttons with better styling
const ControlButtons = ({ onEndClass }) => {
  const room = useRoomContext();
  const [micEnabled, setMicEnabled] = useState(true);
  const [participants, setParticipants] = useState(0);

  useEffect(() => {
    if (!room || !room.participants) return;
    setParticipants(room.participants.size + 1);
    
    const updateParticipants = () => {
      if (room && room.participants) {
        setParticipants(room.participants.size + 1);
      }
    };
    
    room.on(RoomEvent.ParticipantConnected, updateParticipants);
    room.on(RoomEvent.ParticipantDisconnected, updateParticipants);
    
    return () => {
      room.off(RoomEvent.ParticipantConnected, updateParticipants);
      room.off(RoomEvent.ParticipantDisconnected, updateParticipants);
    };
  }, [room]);

  const toggleMic = async () => {
    if (!room || !room.localParticipant) return;
    const current = room.localParticipant.isMicrophoneEnabled;
    await room.localParticipant.setMicrophoneEnabled(!current);
    setMicEnabled(!current);
  };

  const handleEndMeeting = async () => {
    if (!room) return;
    await room.disconnect();
    onEndClass();
  };

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-4 backdrop-blur-lg bg-opacity-95">
        {/* Participant Count */}
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl">
          <Users size={18} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700">{participants}</span>
        </div>

        {/* Mic Toggle */}
        <button
          onClick={toggleMic}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 ${
            micEnabled
              ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
              : "bg-red-500 hover:bg-red-600 text-white"
          }`}
        >
          {micEnabled ? <Mic size={20} /> : <MicOff size={20} />}
          <span className="hidden sm:inline">{micEnabled ? "Mute" : "Unmute"}</span>
        </button>

        {/* End Class */}
        <button
          onClick={handleEndMeeting}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-all duration-200 transform hover:scale-105"
        >
          <PhoneOff size={20} />
          <span className="hidden sm:inline">End Class</span>
        </button>
      </div>
    </div>
  );
};

// Enhanced Slide Sync with better UI
const SlideSync = ({ slides, classTitle }) => {
  const room = useRoomContext();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { token } = useAuthStore();

  useEffect(() => {
    if (!room) return;

    const handleData = (payload, participant, kind) => {
      try {
        const msg = JSON.parse(new TextDecoder().decode(payload));
        if (msg.type === "slide") {
          setCurrentSlide(msg.slideIndex);
        }
      } catch (err) {
        console.error("Error parsing slide data:", err);
      }
    };

    room.on(RoomEvent.DataReceived, handleData);
    return () => {
      room.off(RoomEvent.DataReceived, handleData);
    };
  }, [room]);

  const sendSlideUpdate = (newIndex) => {
    if (!room || !room.localParticipant) return;
    const msg = JSON.stringify({ type: "slide", slideIndex: newIndex });
    const data = new TextEncoder().encode(msg);
    room.localParticipant.publishData(data, { reliable: true });
  };

  const changeSlide = (newIndex) => {
    if (newIndex < 0 || newIndex >= slides.length) return;
    setCurrentSlide(newIndex);
    sendSlideUpdate(newIndex);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Maximize2 size={32} className="text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg">No slides available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${isFullscreen ? 'fixed inset-0 z-40 bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
      {/* Header */}
      <div className={`px-6 py-4 ${isFullscreen ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h2 className={`text-2xl font-bold ${isFullscreen ? 'text-white' : 'text-gray-800'}`}>
              {classTitle || "Live Class"}
            </h2>
            <p className={`text-sm ${isFullscreen ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
              Slide {currentSlide + 1} of {slides.length}
            </p>
          </div>
          <button
            onClick={toggleFullscreen}
            className={`p-2 rounded-lg transition-colors ${
              isFullscreen 
                ? 'hover:bg-gray-700 text-white' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <Maximize2 size={20} />
          </button>
        </div>
      </div>

      {/* Slide Display */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        {/* Previous Button */}
        <button
          onClick={() => changeSlide(currentSlide - 1)}
          disabled={currentSlide === 0}
          className={`absolute left-4 z-10 p-4 rounded-full transition-all duration-200 ${
            currentSlide === 0
              ? 'opacity-30 cursor-not-allowed'
              : 'hover:scale-110 shadow-lg'
          } ${isFullscreen ? 'bg-gray-800 text-white' : 'bg-white text-gray-700'}`}
        >
          <ChevronLeft size={24} />
        </button>

        {/* Slide Image */}
        <div className={`max-w-6xl w-full ${isFullscreen ? 'h-full' : ''}`}>
          <img
            src={slides[currentSlide]}
            alt={`Slide ${currentSlide + 1}`}
            className={`w-full rounded-2xl shadow-2xl object-contain transition-opacity duration-300 ${
              isFullscreen ? 'max-h-screen' : 'max-h-[70vh]'
            }`}
          />
        </div>

        {/* Next Button */}
        <button
          onClick={() => changeSlide(currentSlide + 1)}
          disabled={currentSlide === slides.length - 1}
          className={`absolute right-4 z-10 p-4 rounded-full transition-all duration-200 ${
            currentSlide === slides.length - 1
              ? 'opacity-30 cursor-not-allowed'
              : 'hover:scale-110 shadow-lg'
          } ${isFullscreen ? 'bg-gray-800 text-white' : 'bg-white text-gray-700'}`}
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className={`px-6 py-4 ${isFullscreen ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="max-w-7xl mx-auto">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => changeSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentSlide
                    ? 'bg-blue-500 scale-125'
                    : isFullscreen 
                      ? 'bg-gray-600 hover:bg-gray-500' 
                      : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const AudioBroadcastPage = () => {
  const { token } = useAuthStore();
  const { id } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const handleDisconnect = async () => {
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

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Starting class...</p>
        </div>
      </div>
    );
  }

  if (!details?.token) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <PhoneOff size={32} className="text-red-500" />
          </div>
          <p className="text-gray-700 text-lg font-medium">Unable to join class</p>
        </div>
      </div>
    );
  }

  const slides = details.class?.slides || [];
  const classTitle = details.class?.title || "Live Class";

  return (
    <div className="h-screen bg-gray-50">
      <LiveKitRoom
        audio
        token={details.token}
        serverUrl={details.wsUrl}
        data-lk-theme="default"
        className="h-full"
        onDisconnected={handleDisconnect}
      >
        <SlideSync slides={slides} classTitle={classTitle} />
        <ControlButtons onEndClass={handleDisconnect} />
      </LiveKitRoom>
    </div>
  );
};

export default AudioBroadcastPage;