import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Download,
  VideoIcon,
} from "lucide-react";
import {
  addVideo,
  getAllVideos,
  getAllLectures,
} from "../../lib/videoDB";
import VideoThumbnail from "../../components/VideoThumbnail";
import ThumbnailSkeleton from "../../components/ThumbnailSkeleton";
import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {FetchStudentAudioLectures} from '../../components/FetchStudentAudioLectures.jsx'

const StudentLecturePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();

  // --- State ---
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState({});
  const [downloadedIds, setDownloadedIds] = useState(new Set());
  const [lectures, setLectures] = useState([]);
  const [offlineVideos, setOfflineVideos] = useState([]);
  const [offlineLectures, setOfflineLectures] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [AudioLectures, setAudioLectures] = useState([]);
    const [selectedAudioLecture, setSelectedAudioLecture] = useState(null);

  const [AudioLectureloading, setAudioLectureloading] = useState(true);
  // --- Refs ---
  const createdObjectUrlsRef = useRef(new Set());

  // --- Online / Offline state listeners ---
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);

      // Cleanup all created object URLs
      createdObjectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  // --- Fetch lectures and offline data ---
  useEffect(() => {
    async function fetchData() {
      try {
        let backendLectures = [];

        if (isOnline) {
          const res = await axios.get(
            `http://localhost:3000/api/students/courses/${id}/lectures`,
            { withCredentials: true }
          );
          backendLectures = res.data.lectures || [];
          setLectures(backendLectures);
        }

        const dbVideos = await getAllVideos();
        const offlineMapped = dbVideos.map((v) => {
          if (v.blob instanceof Blob) {
            const objUrl = URL.createObjectURL(v.blob);
            createdObjectUrlsRef.current.add(objUrl);
            return { ...v, objectUrl: objUrl };
          }
          return v;
        });

        const dbLectures = await getAllLectures();

        setDownloadedIds(new Set(dbVideos.map((v) => v.id)));
        setOfflineVideos(offlineMapped);
        setOfflineLectures(dbLectures);
      } catch (error) {
        console.error("Error fetching videos:", error);
        toast.error("Failed to fetch lectures.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, isOnline]);

  // --- Handle video download ---
  async function handleDownload(url, vidId, title) {
    try {
      setDownloading((prev) => ({ ...prev, [vidId]: true }));
      const res = await axios.get(url, { responseType: "blob" });
      const videoBlob = res.data;

      const videoFile = {
        id: vidId || crypto.randomUUID(),
        title: title || `video_${vidId}`,
        blob: videoBlob,
      };

      await addVideo(videoFile);

      const objUrl = URL.createObjectURL(videoBlob);
      createdObjectUrlsRef.current.add(objUrl);

      setOfflineVideos((prev) => [...prev, { ...videoFile, objectUrl: objUrl }]);
      setDownloadedIds((prev) => new Set(prev).add(videoFile.id));

      toast.success("Video saved offline!");
    } catch (err) {
      console.error("Download failed:", err);
      toast.error("Failed to save video offline.");
    } finally {
      setDownloading((prev) => ({ ...prev, [vidId]: false }));
    }
  }
  // ------------------- Fetch Audio Lectures -------------------

    useEffect(() => {
    const fetchAudioLectures = async () => {
      try {
        const res = await axios.get( `http://localhost:3000/api/students/audiocourses/${id}/lectures`,{withCredentials:true});
        console.log(res.data);
        
        setAudioLectures(res.data.lectures || []);
      } catch (e) {
        console.error("Error fetching audio lectures:", e);
      } finally {
        setAudioLectureloading(false);
      }
    };
    fetchAudioLectures();
  }, []);

  // ------------------- Download Audio Lecture Offline -------------------
  const handleOfflineDownload = async (lecture) => {
    try {
      setDownloading((prev) => ({ ...prev, [lecture._id]: true }));

      // Audio
      const audioUrl = lecture.audio.startsWith("http")
        ? lecture.audio
        : `${backendUrl}${lecture.audio}`;
      const audioRes = await axios.get(audioUrl, { responseType: "blob" });

      // Slides
      const slideBlobs = await Promise.all(
        lecture.slides.map(async (slide) => {
          const url = slide.slideUrl.startsWith("http")
            ? slide.slideUrl
            : `${backendUrl}${slide.slideUrl}`;
          const res = await axios.get(url, { responseType: "blob" });
          return { blob: res.data, startTime: slide.startTime };
        })
      );

      const lectureObj = {
        id: lecture._id,
        title: lecture.title,
        audio: audioRes.data,
        slides: slideBlobs,
      };
      await addLecture(lectureObj);
      setOfflineLectures((prev) => [...prev, lectureObj]);
      toast.success("Audio+Slide Lecture saved offline!");
    } catch (err) {
      console.error("Download lecture failed:", err);
      toast.error("Failed to save lecture offline.");
    } finally {
      setDownloading((prev) => ({ ...prev, [lecture._id]: false }));
    }
  };


  return (
    <div className="bg-gray-50 p-6 space-y-6">
      <div>
        <button
          onClick={() => navigate("/student")}
          type="button"
          className="flex cursor-pointer bg-blue-700 text-amber-50 p-1 rounded-md items-center gap-2"
        >
          <ArrowLeft />
          Back to Course
        </button>
      </div>

      <div>
        <h1 className="text-3xl font-medium">Course Lectures</h1>
        <p className="text-sm text-gray-400">
          Access all recorded lectures and course materials
        </p>
      </div>

              {/* Audio Lectures (Online) */}
        <FetchStudentAudioLectures
          selectedAudioLecture={selectedAudioLecture}
          AudioLectureloading={AudioLectureloading}
          handleOfflineDownload={handleOfflineDownload}
          AudioLectures={AudioLectures}
          offlineLectures={offlineLectures} // <-- pass offline lectures
          downloading={downloading} // <-- pass downloading state
        />

      {lectures && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <VideoIcon className="w-5 h-5 text-indigo-600" />
              {t("onlineLibrary")}
            </h2>
            <span className="text-sm text-gray-500">
              {t("lectureCount", { count: lectures.length })}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white border rounded-2xl shadow-sm overflow-hidden"
                >
                  <ThumbnailSkeleton />
                </div>
              ))}
            </div>
          ) : lectures.length === 0 ? (
            <div className="text-center py-20 bg-white border rounded-2xl shadow-sm">
              <p className="text-lg text-gray-600">{t("noOnlineLectures")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {lectures.map((video) => {
                const isDownloaded = downloadedIds.has(video.id);
                return (
                  <div
                    key={video.id}
                    className="bg-white border rounded-2xl shadow-sm overflow-hidden flex flex-col"
                  >
                    <VideoThumbnail url={video.url} title={video.title} />
                    <div className="p-5 flex flex-col flex-grow">
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <h3 className="font-medium text-gray-800 line-clamp-2 flex-1">
                          {video.title}
                        </h3>
                        <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                          <BookOpen className="w-3 h-3" />
                          {video.course_name}
                        </span>
                      </div>

                      <div className="mt-auto flex gap-3">
                        <button
                          onClick={() => window.open(video.url, "_blank")}
                          className="flex-1 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-full font-medium shadow-sm transition text-center"
                        >
                          {t("watch")}
                        </button>
                        {!isDownloaded && (
                          <button
                            onClick={() =>
                              handleDownload(video.url, video.id, video.title)
                            }
                            disabled={downloading[video.id]}
                            className="flex items-center cursor-pointer justify-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-full font-medium shadow-sm transition"
                          >
                            {downloading[video.id] ? (
                              t("downloading")
                            ) : (
                              <>
                                <Download className="w-4 h-4" /> {t("download")}
                              </>
                            )}
                          </button>
                        )}
                        {isDownloaded && (
                          <span className="flex items-center gap-1 text-green-600 bg-green-50 border border-green-200 px-4 py-2 rounded-full text-sm font-medium">
                            <CheckCircle className="w-4 h-4" /> {t("saved")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default StudentLecturePage;
