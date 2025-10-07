import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
const backendUrl = "http://localhost:3000"; // your backend

export default function AudioLecturePlayer() {
  const navigate=useNavigate();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [lecture, setLecture] = useState(null);
  const audioRef = useRef(null);
  const { id } = useParams();

  const slides = lecture?.slides || [];

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const currentTime = audioRef.current.currentTime;

    let newSlideIndex = 0;
    for (let i = 0; i < slides.length; i++) {
      if (currentTime >= slides[i].startTime) newSlideIndex = i;
      else break;
    }

    if (newSlideIndex !== currentSlideIndex) {
      setCurrentSlideIndex(newSlideIndex);
    }
  };

  useEffect(() => {
    setCurrentSlideIndex(0);
    if (audioRef.current) audioRef.current.currentTime = 0;
  }, [lecture]);

  // Fetch lecture data
  useEffect(() => {
    const fetchLecture = async () => {
      try {
        const res = await axios.get(
          `${backendUrl}/api/lectures/AudioLecturesById/${id}`
        );
        setLecture(res.data.data); // use .data from backend response
      } catch (e) {
        console.error("Error in fetching the lecture", e);
      }
    };
    fetchLecture();
  }, [id]);

  if (!lecture) return <p>Loading Lecture...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Slides */}
      <button onClick={()=> navigate(-1)}
       className="px-4  py-2 m-2 bg-blue-600 text-white rounded-xl"
      >
          Go Back
      </button>
      {slides.length > 0 ? (
        <div className="flex justify-center mb-4">
          <img
            src={`${backendUrl}${slides[currentSlideIndex]?.slideUrl}`}
            alt={`Slide ${currentSlideIndex + 1}`}
            className="w-full max-w-3xl h-auto rounded-lg shadow-md border"
          />
        </div>
      ) : (
        <p className="text-gray-500 mb-4">No slides available.</p>
      )}

      {/* Audio */}
      {lecture.audio ? (
        <audio
          ref={audioRef}
          controls
          src={`${backendUrl}${lecture.audio}`}
          className="w-full mt-4"
          onTimeUpdate={handleTimeUpdate}
        />
      ) : (
        <p className="text-gray-500">No audio available.</p>
      )}
    </div>
  );
}
