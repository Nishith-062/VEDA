import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

export default function TeacherManageClass() {
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.authUser);
  const token = useAuthStore((state) => state.token);

  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [classes, setClasses] = useState([]); 
  const [activeClass, setActiveClass] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true); // ✅ skeleton toggle

  const API_BASE = "http://localhost:3000/api/live-class";

  // ✅ Fetch teacher’s classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get(`${API_BASE}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setClasses(Array.isArray(res.data.classes) ? res.data.classes : []);
      } catch (err) {
        console.error("Error fetching classes:", err.response?.data || err.message);
        setClasses([]);
      } finally {
        setLoadingClasses(false); // ✅ stop skeleton
      }
    };

    if (authUser?._id) fetchClasses();
  }, [authUser, token]);

  // ✅ Schedule new class
  const handleSchedule = async () => {
    if (!title || !startTime) {
      alert("Please provide both title and start time");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        API_BASE,
        { title, startTime, description: "" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setClasses([...classes, res.data.class]); // add new class to list
      alert("Class scheduled successfully!");
      setTitle("");
      setStartTime("");
    } catch (err) {
      console.error("Error scheduling class:", err.response?.data || err.message);
      alert("Error scheduling class: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // ✅ Skeleton UI for class list
  const SkeletonList = () => (
    <ul className="space-y-3 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <li
          key={i}
          className="flex justify-between items-center p-3 border rounded-lg"
        >
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-300 rounded"></div>
            <div className="h-3 w-24 bg-gray-200 rounded"></div>
          </div>
          <div className="h-8 w-20 bg-gray-300 rounded"></div>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="max-w-3xl mx-auto p-6">
      <button
        className="bg-blue-600 p-1.5 rounded-sm cursor-pointer text-white mb-4"
        onClick={() => {
          navigate("/teacher");
        }}
      >
        Back
      </button>

      <h1 className="text-3xl font-bold mb-6">Manage Your Live Classes</h1>

      {/* Schedule New Class */}
      <div className="bg-white border rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Schedule New Class</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Class Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
          <button
            onClick={handleSchedule}
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white ${
              loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Scheduling..." : "Schedule Class"}
          </button>
        </div>
      </div>

      {/* Scheduled Classes List */}
      <div className="bg-white border rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Scheduled Classes</h2>
        {loadingClasses ? (
          <SkeletonList /> // ✅ show skeleton
        ) : classes.length === 0 ? (
          <p className="text-gray-500">No classes scheduled yet.</p>
        ) : (
          <ul className="space-y-3">
            {classes.map((cls) => (
              <li
                key={cls._id}
                className="flex justify-between items-center p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{cls.title}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(cls.startTime).toLocaleString()}
                  </p>
                </div>
                {cls.status === "liv" ? (
                  <span className="text-red-600 font-semibold">Live</span>
                ) : (
                  <button
                    onClick={() =>
                      navigate(`/teacher/class/${cls._id}/broadcast`)
                    }
                    className="px-4 py-2 bg-green-600 text-white rounded"
                  >
                    Start Live
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
