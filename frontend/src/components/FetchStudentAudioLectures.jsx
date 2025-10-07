import { Download, VideoIcon, CheckCircle } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const backendUrl = "https://veda-bj5v.onrender.com";

export const FetchStudentAudioLectures = ({
  AudioLectures = [],
  handleOfflineDownload,
  AudioLectureloading = false,
  selectedAudioLecture = null,
  offlineLectures = [],
  downloading = {},
}) => {
  const navigate = useNavigate();

  const downloadedAudioIds = new Set((offlineLectures || []).map((l) => l.id));

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-750 flex items-center gap-2">
          <VideoIcon className="w-5 h-5 text-blue-600" />
          Audio+Slide Lectures
        </h2>
      </div>

      {AudioLectureloading ? (
        <div className="text-center py-10 bg-white border rounded-2xl shadow-sm">
          <p>Loading Audio Lectures...</p>
        </div>
      ) : AudioLectures.length === 0 ? (
        <p>No Audio Lectures Uploaded</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-3">
          {AudioLectures.map((lecture) => {
            const isDownloaded = downloadedAudioIds.has(lecture._id);
            const isDownloading = downloading[lecture._id] || false;

            return (
              <div key={lecture._id} className="bg-white border rounded-2xl p-1 shadow-sm flex flex-col">
                {lecture.slides?.[0] && (
                  <img
                    src={
                      lecture.slides[0].slideUrl.startsWith('http')
                        ? lecture.slides[0].slideUrl
                        : `${backendUrl}${lecture.slides[0].slideUrl}`
                    }
                    alt="First Slide"
                    className="w-full h-40 rounded-lg object-cover"
                  />
                )}

                <h3 className="font-medium text-gray-800 mb-2 p-4">{lecture.title}</h3>

                <div className="flex gap-3 mt-4 px-4">
                  <button
                    onClick={() => navigate(`/student/Audiolecture/${lecture._id}`)}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 m-3 rounded-full font-medium shadow-sm transition"
                  >
                    Watch
                  </button>

                  {isDownloaded ? (
                    <span className="flex items-center gap-2 flex-1 justify-center bg-green-50 border border-green-200 text-green-600 py-2 m-3 rounded-full font-medium shadow-sm">
                      <CheckCircle className="w-4 h-4" /> Saved
                    </span>
                  ) : (
                    <button
                      onClick={() => handleOfflineDownload(lecture)}
                      disabled={isDownloading}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 m-3 rounded-full font-medium shadow-sm transition flex items-center justify-center gap-2"
                    >
                      {isDownloading ? 'Downloading...' : <>
                        <Download className="w-4 h-4" /> Download
                      </>}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
