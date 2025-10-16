import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import axios from "axios";

function AudioSlideStreamManage() {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const authUser = useAuthStore((state) => state.authUser);
  const API_BASE = "http://localhost:3000/api/Audioclass-live";

  const titleRef = useRef();
  const startTimeRef = useRef();
  const fileRef = useRef();

  const [formdata, setformdata] = useState({
    title: "",
    file: null,
    starttime: "",
  });
  const [loading, setloading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formdata.title || !formdata.file || !formdata.starttime) {
      alert("Fill all the details Before scheduling");
      return;
    }

    const data = new FormData();
    data.append("title", formdata.title);
    data.append("starttime", formdata.starttime);
    data.append("pdf", formdata.file);

    try {
      setloading(true);
      await axios.post(API_BASE, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Class Scheduled Successfully");

      // Reset form state
      setformdata({ title: "", starttime: "", file: null });
      titleRef.current.value = "";
      startTimeRef.current.value = "";
      fileRef.current.value = null;

      // Refresh classes
      fetchClasses();
    } catch (e) {
      alert("Error in Scheduling the class: " + (e.response?.data?.message || e.message));
    } finally {
      setloading(false);
    }
  };

  // Fetch classes
  const fetchClasses = async () => {
    setLoadingClasses(true);
    try {
      const res = await axios.get(API_BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(Array.isArray(res.data.classes) ? res.data.classes : []);
    } catch (err) {
      console.error("Error fetching classes:", err.response?.data || err.message);
      setClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  };

  useEffect(() => {
    if (authUser?._id) fetchClasses();
  }, [authUser]);

  // Skeleton UI for loading
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
        onClick={() => navigate(-1)}
        className="p-3 m-2 rounded-lg bg-green-600 text-white font-bold"
      >
        Back
      </button>

      {/* Schedule Form */}
      <div className="border bg-white p-6 mb-6 rounded-xl">
        <h1 className="text-2xl font-semibold m-3">
          Schedule Audio Slide Live Class
        </h1>
        <div>
          <input
            type="text"
            placeholder="Enter the Title..."
            className="w-full m-3 p-2 rounded-lg border"
            onChange={(e) => setformdata({ ...formdata, title: e.target.value })}
            ref={titleRef}
          />
          <input
            type="datetime-local"
            className="w-full m-3 p-2 rounded-lg border"
            onChange={(e) => setformdata({ ...formdata, starttime: e.target.value })}
            ref={startTimeRef}
          />
          <label className="text-lg font-medium text-gray-700 m-5">
            Add PDF File
          </label>
          <br />
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setformdata({ ...formdata, file: e.target.files[0] })}
            ref={fileRef}
            className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500
               file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold
               file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
          />
          <p className="text-sm text-gray-600 m-3 p-2">
            {formdata.file ? formdata.file.name : "No File Selected"}
          </p>
          <button
            onClick={handleSubmit}
            className="w-full py-2 rounded-lg text-white bg-green-600"
            disabled={loading}
          >
            {loading ? "Scheduling..." : "Schedule"}
          </button>
        </div>
      </div>

      {/* Scheduled Classes */}
      <div className="border bg-white p-6 mb-6 rounded-xl">
        <h1 className="font-semibold text-xl">Your Scheduled Live Audio Classes</h1>
        {loadingClasses ? (
          <SkeletonList />
        ) : classes.length === 0 ? (
          <p>No Schedules Found</p>
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
                  <span className="text-red-600 font-semibold">live</span>
                ) : (
                  <button
                    onClick={() => navigate(`/teacher/class/${cls._id}/Slidebroadcast`)}
                    className="px-4 py-2 bg-green-600 text-white rounded cursor-pointer"
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

export default AudioSlideStreamManage;
