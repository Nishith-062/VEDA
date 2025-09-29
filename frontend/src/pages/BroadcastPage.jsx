import { useParams, useNavigate } from "react-router-dom";
import BroadCastLiveStream from "../components/BroadCastLiveStream";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect, useState } from "react";
import axios from "axios";

export default function BroadcastPage() {
  const API_BASE = "https://veda-bj5v.onrender.com/api/live-class";
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const authUser = useAuthStore((state) => state.authUser);

  const [streamData, setStreamData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const startClass = async () => {
      try {
        // ✅ Fixed: headers should be in config object, not body
        const res = await axios.post(
          `${API_BASE}/${id}/start`,
          {}, // empty body
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("API Response:", res.data);

        // ✅ Extract userId from response
        const { token: liveToken, apiKey, streamId, userId, class: liveClass } = res.data;

        setStreamData({
          apiKey,
          token: liveToken,
          streamId: streamId || liveClass?.streamId, // Use streamId from response
          userId: userId || authUser._id.toString(), // Use userId from response
        });
      } catch (err) {
        console.error("Error starting class:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Failed to start class");
        setStreamData(null);
      }
    };

    if (authUser?._id && token) startClass();
  }, [authUser, token, id]);

  const handleEndClass = async () => {
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
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Broadcasting Live Class</h1>
        <button
          onClick={handleEndClass}
          className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
        >
          End Class
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700">
          Error: {error}
        </div>
      )}

      {!streamData && !error && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-xl">Starting broadcast...</div>
        </div>
      )}

      {streamData && (
        <div className="flex-1 p-4">
          <BroadCastLiveStream
            apiKey={streamData.apiKey}
            token={streamData.token}
            userId={streamData.userId}
            classId={streamData.streamId}

          />
        </div>
      )}
    </div>
  );
}