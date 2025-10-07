import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function AudioLecturePlayer({ lecture: propLecture }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [lecture, setLecture] = useState(propLecture || null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const audioRef = useRef(null);

  const slides = lecture?.slides || [];

  // Fetch lecture if no prop is provided (page view)
  useEffect(() => {
    if (!propLecture && id) {
      const fetchLecture = async () => {
        try {
          const res = await axios.get(`/api/lectures/audio/${id}`);
          setLecture(res.data.data);
        } catch (err) {
          console.error("Error fetching lecture:", err);
        }
      };
      fetchLecture();
    }
  }, [id, propLecture]);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const currentTime = audioRef.current.currentTime;

    let newSlideIndex = 0;
    for (let i = 0; i < slides.length; i++) {
      if (currentTime >= slides[i].startTime) newSlideIndex = i;
      else break;
    }

    if (newSlideIndex !== currentSlideIndex) setCurrentSlideIndex(newSlideIndex);
  };

  useEffect(() => {
    setCurrentSlideIndex(0);
    if (audioRef.current) audioRef.current.currentTime = 0;
  }, [lecture]);

  if (!lecture) return <p>Loading Lecture...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 m-2 bg-blue-600 text-white rounded-xl"
      >
        Go Back
      </button>

      {slides.length > 0 ? (
        <div className="flex justify-center mb-4">
          <img
            src={slides[currentSlideIndex]?.slideUrl} // Cloudinary URL is absolute
            alt={`Slide ${currentSlideIndex + 1}`}
            className="w-full max-w-3xl h-auto rounded-lg shadow-md border"
          />
        </div>
      ) : (
        <p className="text-gray-500 mb-4">No slides available.</p>
      )}

      {lecture.audio ? (
        <audio
          ref={audioRef}
          controls
          src={lecture.audio} // Cloudinary URL is absolute
          className="w-full mt-4"
          onTimeUpdate={handleTimeUpdate}
        />
      ) : (
        <p className="text-gray-500">No audio available.</p>
      )}
    </div>
  );
}
