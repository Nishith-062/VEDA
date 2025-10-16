import React, { useEffect, useState } from "react";
import {
  LiveKitRoom,
  useTracks,
  ControlBar,
  GridLayout,
  ParticipantTile,
  useRoomContext,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "@livekit/components-styles";
import { useAuthStore } from "../store/useAuthStore";

const BASE_URL = "http://localhost:3000/api/Audioclass-live";

// ✅ Show only subscribed audio participants (no camera)
const TracksView = () => {
  const tracks = useTracks([{ source: Track.Source.Microphone }], {
    onlySubscribed: true,
  });

  return (
    <GridLayout
      tracks={tracks}
      style={{ height: "calc(100vh - var(--lk-control-bar-height))" }}
    >
      <ParticipantTile />
    </GridLayout>
  );
};

const AudioBroadcastpage = () => {
  const { token, authUser } = useAuthStore();
  const { id } = useParams();
  const navigate = useNavigate();
  const [room,setRoom]=useState(null);

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch LiveKit room token + class details
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
      } catch (error) {
        console.error("Error starting class:", error);
        alert("Failed to start class");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  // Handle user disconnect
  async function handleDisconnect() {
    try {
      await axios.post(
        `${BASE_URL}/${id}/end`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/teacher");
    } catch (error) {
      console.error("Error ending class:", error);
    }
  }

  if (loading) return <p>Starting class...</p>;
  if (!details?.token) return <p>Unable to join the live class.</p>;

  const slides = details.class?.slides || [];

    const nextSlide = () => {
    setCurrentSlide((prev) => {
      const newIndex = prev + 1 < slides.length ? prev + 1 : prev;

      // send metadata to students
      if (room?.localParticipant) {
        room.localParticipant.setMetadata(
          JSON.stringify({ slideIndex: newIndex })
        );
      }

      return newIndex;
    });
  };

   const prevSlide= () => {
    setCurrentSlide((prev) => {
      const newIndex = prev -1 >=0 ? prev -1 : prev;

      // send metadata to students
      if (room?.localParticipant) {
        room.localParticipant.setMetadata(
          JSON.stringify({ slideIndex: newIndex })
        );
      }

      return newIndex;
    });
  };
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left side: Slides */}
      <div className="w-1/2 bg-white flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold mb-4">{details.class.title}</h2>
        {slides.length > 0 ? (
          <div className="flex flex-col items-center space-y-3 w-full">
            <img
              src={slides[currentSlide]}
              alt={`Slide ${currentSlide + 1}`}
              className="rounded-lg shadow max-h-[80vh] object-contain"
            />
            <div className="flex justify-between w-full mt-4">
              <button
                onClick={prevSlide}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                disabled={currentSlide === 0}
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Slide {currentSlide + 1} / {slides.length}
              </span>
              <button
                onClick={nextSlide}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                disabled={currentSlide === slides.length - 1}
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <p>No slides available</p>
        )}
      </div>

      {/* Right side: LiveKit audio room */}
      <div
        className="w-1/2 h-full cursor-pointer"
        onClick={nextSlide} // Click anywhere on audio panel to move slide
      >
        <LiveKitRoom
          audio
          token={details.token}
          serverUrl={details.wsUrl}
          data-lk-theme="default"
          onDisconnected={handleDisconnect}
            onConnected={(connectedRoom) => setRoom(connectedRoom)}
        >
          <TracksView />
          <ControlBar />
        </LiveKitRoom>
      </div>
    </div>
  );
};

export default AudioBroadcastpage;
