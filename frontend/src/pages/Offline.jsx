import React, { useEffect, useMemo, useState } from "react";
import { getAllVideos } from "../lib/videoDB";
import { useNavigate } from "react-router-dom";

function makeBlobFromStored(blobLike) {
  // Accepts:
  // - Blob -> returns as-is
  // - data:* string -> return as-is (usable as src)
  // - Uint8Array / ArrayBuffer -> wrap into Blob (assume video/mp4 if unknown)
  if (!blobLike) return null;
  if (typeof blobLike === "string" && blobLike.startsWith("data:")) return blobLike;
  if (blobLike instanceof Blob) return blobLike;
  if (blobLike instanceof ArrayBuffer) return new Blob([blobLike], { type: "video/mp4" });
  if (ArrayBuffer.isView(blobLike)) return new Blob([blobLike.buffer || blobLike], { type: "video/mp4" });
  return null;
}

const OfflineDownloads = () => {
  const [videos, setVideos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = (await getAllVideos()) || [];
        if (!cancelled) setVideos(data);
      } catch (err) {
        console.error("Failed to read local videos", err);
        if (!cancelled) setVideos([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Map videos -> stable srcs (object URLs or data URLs). Revoke on unmount
  const videoSrcs = useMemo(() => {
    const created = []; // { id, url, revokeFn }
    for (const v of videos) {
      const b = makeBlobFromStored(v.blob);
      if (!b) {
        created.push({ id: v.id, url: null, revoke: () => {} });
        continue;
      }
      if (typeof b === "string") {
        created.push({ id: v.id, url: b, revoke: () => {} });
      } else {
        const url = URL.createObjectURL(b);
        created.push({ id: v.id, url, revoke: () => URL.revokeObjectURL(url) });
      }
    }
    return created;
    // Recompute whenever videos array identity changes
  }, [videos]);

  // Revoke object URLs when component unmounts or videos change
  useEffect(() => {
    return () => {
      for (const item of videoSrcs) {
        if (item.revoke) item.revoke();
      }
    };
  }, [videoSrcs]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Offline Downloads</h1>

      {!navigator.onLine && (
        <div className="mt-2 mb-3 text-sm text-yellow-300">
          You are offline — showing saved videos only.
        </div>
      )}

      {navigator.onLine && (
        <button
          className="bg-blue-600 p-1.5 rounded-sm cursor-pointer text-white mb-4"
          onClick={() => navigate("/login")}
        >
          Home
        </button>
      )}

      {videos.length === 0 ? (
        <p>No saved videos.</p>
      ) : (
        <div className="grid gap-4 mt-4">
          {videos.map((video) => {
            const srcObj = videoSrcs.find((s) => s.id === video.id);
            const src = srcObj ? srcObj.url : null;
            return (
              <div key={video.id} className="border p-3 rounded-lg">
                <h2>{video.title || "Untitled"}</h2>
                {src ? (
                  <video controls className="w-full mt-2 rounded" src={src} />
                ) : (
                  <div className="mt-2 text-sm text-gray-400">Corrupt or unsupported video data</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OfflineDownloads;
