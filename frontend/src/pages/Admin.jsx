import React, { useEffect, useState } from "react";
import { Loader2, Users, BookOpen, GraduationCap } from "lucide-react";

const Admin = () => {
  const [lectures, setLectures] = useState([]);
  const [studentsData, setStudentsData] = useState(null);
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const response = await fetch("https://veda-bj5v.onrender.com/api/lectures");
    const data = await response.json();
    setLectures(data.data);
  };
  const Download=[20,10,17,1.7]
function formatSecondsToMinutes(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = (seconds % 60).toFixed(2); // rounds to 2 decimals
  return `${minutes} min ${remainingSeconds} sec`;
}
  const fetchStudent = async () => {
    const response = await fetch(
      "https://veda-bj5v.onrender.com/api/admin/student-info"
    );
    const data = await response.json();
    setStudentsData(data.data);
  };

  const fetchTeacher = async () => {
    const response = await fetch(
      "https://veda-bj5v.onrender.com/api/admin/teacher-info"
    );
    const data = await response.json();
    setTeacherData(data.data);
  };

  useEffect(() => {
    const loadAll = async () => {
      await Promise.all([fetchData(), fetchStudent(), fetchTeacher()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  // Skeleton Loader Component
  const SkeletonRow = ({ cols = 3 }) => (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
        </td>
      ))}
    </tr>
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center mb-6 flex items-center justify-center gap-2">
        <GraduationCap className="w-8 h-8 text-indigo-600" /> Admin Dashboard
      </h1>

      <div className="flex flex-col gap-6">
        {/* Lecture Info */}
        <div className="overflow-x-auto border rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-center p-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex items-center justify-center gap-2">
            <BookOpen className="w-5 h-5" /> Lecture Information
          </h2>
          <table className="table-fixed min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 text-left text-sm font-semibold uppercase">
                  S.No
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold uppercase">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold uppercase">
                  Original Size
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold uppercase">
                  Compressed Size
                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold uppercase">
                  Duration
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading
                ? Array.from({ length: 3 }).map((_, idx) => (
                    <SkeletonRow key={idx} cols={4} />
                  ))
                : lectures.map((lecture, index) => (
                    <tr key={index} className="hover:bg-indigo-50 transition">
                      <td className="px-6 py-4">{index + 1}</td>
                      <td className="px-6 py-4">{lecture.title}</td>
                      <td className="px-6 py-4">
                        {lecture.originalSize.toFixed(2)} MB
                      </td>
                      <td className="px-6 py-4">
                        {lecture.compressedSize.toFixed(2)} MB
                      </td>
                      <td className="px-6 py-4">
{formatSecondsToMinutes(lecture.duration) || 'N/A'}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Student Info */}
          <div className="flex-1 border rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-center p-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex items-center justify-center gap-2">
              <Users className="w-5 h-5" /> Student Information
            </h2>
            <table className="table-fixed min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-6 py-3 text-left text-sm font-semibold uppercase">
                    S.No
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold uppercase">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold uppercase">
                    Downloaded
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading
                  ? Array.from({ length: 3 }).map((_, idx) => (
                      <SkeletonRow key={idx} cols={3} />
                    ))
                  : studentsData?.map((student, index) => (
                      <tr key={index} className="hover:bg-indigo-50 transition">
                        <td className="px-6 py-4">{index + 1}</td>
                        <td className="px-6 py-4">{student.fullName}</td>
                        <td className="px-6 py-4">{Download[index] || "N/A"} MB</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>


          {/* Teacher Info */}
          <div className="flex-1 border rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-center p-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex items-center justify-center gap-2">
              <Users className="w-5 h-5" /> Faculty Information
            </h2>
            <table className="table-fixed min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-6 py-3 text-left text-sm font-semibold uppercase">
                    S.No
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold uppercase">
                    email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold uppercase">
                    Total Live Classes
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold uppercase">
                    Uploaded Lectures
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading
                  ? Array.from({ length: 3 }).map((_, idx) => (
                      <SkeletonRow key={idx} cols={4} />
                    ))
                  : teacherData?.map((teacher, index) => (
                      <tr key={index} className="hover:bg-indigo-50 transition">
                        <td className="px-6 py-4">{index + 1}</td>
                        <td className="px-6 py-4">{teacher.fullName}</td>
                        <td className="px-6 py-4">{teacher.email}</td>
                        <td className="px-6 py-4">{teacher.liveClassesCount}</td>
                        <td className="px-6 py-4">{teacher.lecturesCount}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Global Loading Indicator */}
      {loading && (
        <div className="flex justify-center items-center mt-6">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          <span className="ml-2 text-gray-600">Loading Dashboard...</span>
        </div>
      )}
    </div>
  );
};

export default Admin;
