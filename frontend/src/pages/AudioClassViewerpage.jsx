import React, { useEffect, useState } from "react";
import { LiveKitRoom, useTracks, GridLayout, ParticipantTile } from "@livekit/components-react";
import { Track } from "livekit-client";
import { useAuthStore } from "../store/useAuthStore";
import { useParams } from "react-router-dom";
import axios from "axios";

const BASE_URL = "http://localhost:3000/api/Audioclass-live";

const AudioClassViewerpage = () => {
  const { token: authToken } = useAuthStore();
  const { id } = useParams();

  const [details, setDetails] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authToken) return;

    const fetchData = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/${id}/join`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setDetails(res.data);
        console.log(res.data);
        
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authToken, id]);

  if (loading) return <p>Loading class...</p>;
  if (!details?.token) return <p>Unable to join class.</p>;

  const slides = details.class?.slides || [];

  return (
    <div className="flex h-screen">
      {/* Left: Slides */}
      <div className="w-1/2 bg-white flex items-center justify-center p-4">
        {slides.length > 0 ? (
          <img
            src={slides[currentSlide]}
            alt={`Slide ${currentSlide + 1}`}
            className="max-h-[80vh] object-contain"
          />
        ) : (
          <p>No slides available</p>
        )}
      </div>

      {/* Right: Audio */}
      <div className="w-1/2 h-full">
        <LiveKitRoom
          audio
          token={details.token}
          serverUrl={details.wsUrl}
          onParticipantMetadataChanged={(participant, metadata) => {
            if (metadata) {
              const data = JSON.parse(metadata);
              if (data.slideIndex !== undefined) {
                setCurrentSlide(data.slideIndex);
              }
            }
          }}
        >
          <TracksView />
        </LiveKitRoom>
      </div>
    </div>
  );
};

// Show only subscribed audio participants
const TracksView = () => {
  const tracks = useTracks([{ source: Track.Source.Microphone }], {
    onlySubscribed: true,
  });

  return (
    <GridLayout tracks={tracks} style={{ height: "100%" }}>
      <ParticipantTile />
    </GridLayout>
  );
};

export default AudioClassViewerpage;
