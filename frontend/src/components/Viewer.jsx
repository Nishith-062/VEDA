import React, { useEffect, useState } from "react";
import {
  StreamVideoClient,
  StreamVideo,
  StreamCall,
  LivestreamLayout,
} from "@stream-io/video-react-sdk";
import { useNavigate } from "react-router-dom";
import { Mic } from "lucide-react"; // Import Lucide React icon

const Viewer = ({ apiKey, token, userId, classId }) => {
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [error, setError] = useState(null);
  const [hideVideo, setHideVideo] = useState(false);
  const [lowBandwidth, setLowBandwidth] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initViewer = async () => {
      try {
        const user = { id: userId, name: "Viewer" };
        const clientInstance = StreamVideoClient.getOrCreateInstance({
          apiKey,
          user,
          token,
        });
        setClient(clientInstance);

        const callInstance = clientInstance.call("livestream", classId);
        await callInstance.join();
        setCall(callInstance);

        // Monitor network stats every 5 seconds
        const interval = setInterval(async () => {
          try {
            const stats = await callInstance.getCallStats();

            // Extreme low bandwidth -> hide video
            if (stats.remoteVideoBitrate < 100) {
              setHideVideo(true);
              setLowBandwidth(true);
            } else {
              setHideVideo(false);

              // Low bandwidth -> reduce quality
              if (stats.remoteVideoBitrate < 200) {
                setLowBandwidth(true);
                await callInstance.setPreferredVideoProfile("low");
              } else {
                setLowBandwidth(false);
                await callInstance.setPreferredVideoProfile("high");
              }
            }
          } catch (e) {
            console.warn("Failed to get call stats:", e);
          }
        }, 5000);

        return () => clearInterval(interval);
      } catch (err) {
        console.error("Failed to join stream:", err);
        setError(err.message);
      }
    };

    initViewer();

    return () => {
      if (call) call.leave().catch(console.error);
    };
  }, [apiKey, token, userId, classId]);

  const handleLeave = async () => {
    if (call) await call.leave();
    navigate("/student");
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-red-500 text-lg">
        Error joining stream: {error}
      </div>
    );
  }

  if (!client || !call) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white text-lg">
        Loading stream...
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen bg-black">
      <StreamVideo client={client}>
        <StreamCall call={call}>
          <LivestreamLayout
            showParticipantCount
            showDuration
            showLiveBadge
            className="w-full h-full"
            disableVideo={hideVideo}
            placeholder={
              <div className="relative flex items-center justify-center h-full text-gray-300 text-xl">
                {lowBandwidth && hideVideo && (
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <Mic size={48} className="text-white mb-2" />
                    <span>Low bandwidth network</span>
                  </div>
                )}
                {!hideVideo && !lowBandwidth && "Waiting for host to start streaming..."}
              </div>
            }
          />
        </StreamCall>
      </StreamVideo>

      <button
        onClick={handleLeave}
        className="absolute top-4 right-4 px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-lg transition"
      >
        Leave
      </button>
    </div>
  );
};

export default Viewer;
