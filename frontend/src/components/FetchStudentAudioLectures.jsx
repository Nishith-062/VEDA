import { Download, VideoIcon } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'

export const FetchStudentAudioLectures = ({AudioLectures,handleOfflineDownload,AudioLectureloading,selectedAudioLecture}) => {
    const navigate=useNavigate()
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
              {AudioLectures.map((lecture) => (
                <div key={lecture._id} className="bg-white border rounded-2xl p-1 shadow-sm flex flex-col">
                  {lecture.slides?.[0] && (
                    <img
                      src={lecture.slides[0].slideUrl.startsWith("http") ? lecture.slides[0].slideUrl : `${backendUrl}${lecture.slides[0].slideUrl}`}
                      alt="First Slide"
                      className="w-full h-40 rounded-lg"
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
                    <button
                      onClick={() => handleOfflineDownload(lecture)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 m-3 rounded-full font-medium shadow-sm transition flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" /> Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
  )
}
