import React, { useEffect, useState } from "react";
import {
  StreamVideoClient,
  StreamVideo,
  StreamCall,
  useCall,
  ParticipantView,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

  const API_BASE = "http://localhost:3000/api/live-class";


export default function BroadCastLiveStream({ apiKey, token, userId, classId }) {
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [error, setError] = useState(null);

  const { id } = useParams();

  useEffect(() => {
    const initBroadcast = async () => {
      try {
        const user = { id: userId, name: "Teacher" };

        const clientInstance = StreamVideoClient.getOrCreateInstance({
          apiKey,
          user,
          token,
        });
        setClient(clientInstance);

        const callInstance = clientInstance.call("livestream", classId);
        setCall(callInstance);

        await callInstance.join({ create: true });
        await callInstance.camera.enable();
        await callInstance.microphone.enable();
        await callInstance.goLive();

        console.log("✅ Broadcast started");
      } catch (err) {
        console.error("❌ Failed to start broadcast:", err);
        setError(err.message);
      }
    };

    initBroadcast();

    return () => {
      if (call) {
        call.camera.disable().catch(console.error);
        call.microphone.disable().catch(console.error);
        call.leave().catch(console.error);
      }
    };
  }, [apiKey, token, userId, classId]);

  if (error) return <div className="flex items-center justify-center h-screen bg-gray-900 text-red-500 text-xl font-semibold">{error}</div>;
  if (!client || !call) return <div className="flex items-center justify-center h-screen bg-gray-900 text-white text-xl font-semibold">Loading broadcast...</div>;

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <TeacherView call={call}  classId={classId} id={id} />
      </StreamCall>
    </StreamVideo>
  );
}

const TeacherView = ({ classId, id }) => {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const call = useCall();

  const { useCameraState, useMicrophoneState, useParticipantCount, useIsCallLive, useParticipants } =
    useCallStateHooks();

  const { isEnabled: isCamEnabled } = useCameraState();
  const { isEnabled: isMicEnabled } = useMicrophoneState();
  const participantCount = useParticipantCount();
  const isLive = useIsCallLive();
  const [firstParticipant] = useParticipants();

  const handleGoLive = async () => call?.goLive().catch(console.error);
  const handleStopLive = async () => call?.stopLive().catch(console.error);

  const toggleCamera = async () => {
    if (!call) return;
    try {
      const permission = await navigator.permissions.query({ name: "camera" });
      if (permission.state === "denied") return alert("Camera permission denied");
      if (isCamEnabled) await call.camera.disable();
      else await call.camera.enable();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleMic = async () => {
    if (!call) return;
    try {
      const permission = await navigator.permissions.query({ name: "microphone" });
      if (permission.state === "denied") return alert("Microphone permission denied");
      if (isMicEnabled) await call.microphone.disable();
      else await call.microphone.enable();
    } catch (err) {
      console.error(err);
    }
  };

  const endClass = async () => {
try {
      await axios.post(
        `${API_BASE}/${id}/end`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      navigate("/teacher/classes");
    } catch (err) {
      console.error("Failed to end class:", err);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-black overflow-hidden">
      {/* Status bar */}
      <div className="fixed top-0 left-0 w-full bg-black text-white flex justify-center items-center py-3 z-50 shadow-lg">
        {isLive ? (
          <span className="flex items-center gap-2 text-red-400 font-bold text-lg">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            LIVE — {participantCount} viewer(s)
          </span>
        ) : (
          <span className="text-yellow-400 font-bold text-lg">Preparing broadcast...</span>
        )}

        <button
          onClick={isLive ? handleStopLive : handleGoLive}
          className="ml-6 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-xl transition duration-300 shadow-md"
        >
          {isLive ? "Stop Live" : "Go Live"}
        </button>
      </div>

      {/* Camera view */}
      <div className="flex-1 w-full h-full relative bg-black">
        {firstParticipant ? (
          <ParticipantView participant={firstParticipant} className="absolute inset-0 w-full h-full object-contain" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-xl font-medium bg-black">
            Waiting for camera...
          </div>
        )}
      </div>

      {/* Controls overlay */}
      <div className="fixed bottom-0 left-0 w-full bg-black flex justify-center gap-6 py-4 z-50 shadow-lg">
        <button
          onClick={toggleCamera}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition duration-300 shadow-md"
        >
          {isCamEnabled ? "Disable Camera" : "Enable Camera"}
        </button>

        <button
          onClick={toggleMic}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition duration-300 shadow-md"
        >
          {isMicEnabled ? "Mute Mic" : "Unmute Mic"}
        </button>

        <button
          onClick={endClass}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-xl transition duration-300 shadow-md"
        >
          End Class
        </button>
      </div>
    </div>
  );
};