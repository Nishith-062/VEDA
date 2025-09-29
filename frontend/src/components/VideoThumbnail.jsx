// Generate thumbnails dynamically
import  ThumbnailSkeleton  from "./ThumbnailSkeleton.jsx";
import React, { useEffect, useState } from "react";
export default function VideoThumbnail({ url, title }) {
  const [thumb, setThumb] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const video = document.createElement("video");
    video.src = url;
    video.crossOrigin = "anonymous";
    video.currentTime = 2;

    video.onloadeddata = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      setThumb(canvas.toDataURL("image/png"));
      setLoading(false);
    };
  }, [url]);

  if (loading) return <ThumbnailSkeleton />;
  return (
    <img
      src={thumb}
      alt={title}
      className="w-full h-44 object-cover rounded-t-lg"
    />
  );
}