import React, { useEffect, useState } from "react";
import { getAllVideos } from "../lib/videoDB";
import { useNavigate } from "react-router-dom";

const OfflineDownloads = () => {
  const [videos, setVideos] = useState([]);
  const navigate=useNavigate()

  useEffect(() => {
    (async () => {
      const data = await getAllVideos();
      setVideos(data);
    })();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Offline Downloads</h1>
      {navigator.onLine && 
      
      <button className="bg-blue-600 p-1.5 rounded-sm cursor-pointer text-white" onClick={()=>navigate('/login')}>Home</button>
      }
      {videos.length === 0 ? (
        <p>No saved videos.</p>
      ) : (
        <div className="grid gap-4 mt-4">
          {videos.map((video) => (
            <div key={video.id} className="border p-3 rounded-lg">
              <h2>{video.title || "Untitled"}</h2>
              <video
                controls
                className="w-full mt-2 rounded"
                src={URL.createObjectURL(video.blob)} // video.blob must be a Blob
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OfflineDownloads;
