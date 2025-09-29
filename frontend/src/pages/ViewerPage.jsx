import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Viewer from "../components/Viewer";
import { useAuthStore } from "../store/useAuthStore";
import axios from "axios";

const ViewerPage = () => {
  const { classId } = useParams();
  const { token, authUser } = useAuthStore();

  const [streamData, setStreamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !classId || !authUser) return;

    const fetchStreamData = async () => {
      setLoading(true);
      setError("");
      try {
        // ✅ Changed to POST (your backend uses POST for join)
        const res = await axios.get(
          `http://localhost:3000/api/live-class/${classId}/join`,
          { 
            headers: { Authorization: `Bearer ${token}` } 
          }
        );

        console.log("API Response:", res.data);
        
        // ✅ Extract all needed data
        const { token: liveToken, apiKey, streamId, userId, class: liveClass } = res.data;

        if (!liveToken || !apiKey || (!streamId && !liveClass?.streamId)) {
          setError("Stream data is incomplete or unavailable.");
          setStreamData(null);
        } else {
          setStreamData({
            token: liveToken,
            apiKey,
            streamId: streamId || liveClass.streamId,
            userId: userId || authUser._id.toString(),
          });
        }
      } catch (err) {
        console.error("Error joining class:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Failed to load the stream. Please try again later.");
        setStreamData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStreamData();
  }, [classId, token, authUser]);

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <div className="bg-gray-800 text-white p-4">
        <h1 className="text-2xl font-bold">Live Class</h1>
      </div>

      {loading && (
        <div className="flex-1 flex items-center justify-center text-white">
          <div className="text-xl">Connecting to live class...</div>
        </div>
      )}

      {error && (
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-red-100 text-red-700 p-6 rounded-lg">
            <p className="text-xl font-semibold">{error}</p>
          </div>
        </div>
      )}

      {streamData && !loading && !error && (
        <div className="flex-1">
          <Viewer
            token={streamData.token}
            apiKey={streamData.apiKey}
            userId={streamData.userId}
            classId={streamData.streamId}
          />
        </div>
      )}
    </div>
  );
};

export default ViewerPage;