import React, { useEffect, useState } from "react";
import { Room, RoomEvent } from "livekit-client";
import axios from "axios";

export default function TeacherLive() {
  const [room, setRoom] = useState(null);
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const initRoom = async () => {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/livekit/token`,
        { params: { identity: `teacher_${Date.now()}`, roomName: "demoRoom" } }
      );
      const token = res.data.token;

      const r = new Room();
      await r.connect(import.meta.env.VITE_LIVEKIT_URL, token);
      setRoom(r);
    };

    initRoom();
  }, []);

  const handleNext = () => {
    if (current < slides.length - 1) {
      const next = current + 1;
      setCurrent(next);
      room?.localParticipant.publishData(
        JSON.stringify({ type: "slideChange", index: next }),
        { reliable: true }
      );
    }
  };

  const handlePrev = () => {
    if (current > 0) {
      const prev = current - 1;
      setCurrent(prev);
      room?.localParticipant.publishData(
        JSON.stringify({ type: "slideChange", index: prev }),
        { reliable: true }
      );
    }
  };

  const loadSlides = async () => {
    const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/slides/latest`);
    setSlides(res.data.slides);
  };

  return (
    <div className="p-6 text-center max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Teacher Live Control</h1>
      {slides.length === 0 ? (
        <button
          onClick={loadSlides}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Load Slides
        </button>
      ) : (
        <>
          <img
            src={slides[current]}
            alt={`Slide ${current + 1}`}
            className="w-full max-h-[400px] mx-auto rounded shadow mb-4"
          />
          <div className="flex justify-center gap-4">
            <button
              onClick={handlePrev}
              disabled={current === 0}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={current === slides.length - 1}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
