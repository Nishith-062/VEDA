import React from "react";
import { useNavigate } from "react-router-dom";

const LiveClassTable = ({ classes }) => {
  const navigate = useNavigate();
  const handleJoin = (classId) => {
    // Replace with your actual join logic or redirect
    navigate(`/student/live-class/${classId}`);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="py-3 px-4 text-left">Title</th>
            <th className="py-3 px-4 text-left hidden sm:table-cell">Faculty Name</th>
            <th className="py-3 px-4 text-left hidden md:table-cell">Email</th>
            <th className="py-3 px-4 text-left hidden lg:table-cell">Start Time</th>
            <th className="py-3 px-4 text-left hidden lg:table-cell">End Time</th>
            <th className="py-3 px-4 text-left">Status</th>
            <th className="py-3 px-4 text-left">Join</th>
          </tr>
        </thead>
        <tbody>
          {classes.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center py-4 text-gray-500">
                No classes available
              </td>
            </tr>
          ) : (
            classes.map((cls) => (
              <tr
                key={cls._id}
                className="border-b hover:bg-gray-100 transition-colors"
              >
                <td className="py-2 px-4">{cls.title}</td>
                <td className="py-2 px-4 hidden sm:table-cell">
                  {cls.faculty_id?.fullName || "N/A"}
                </td>
                <td className="py-2 px-4 hidden md:table-cell">
                  {cls.faculty_id?.email || "N/A"}
                </td>
                <td className="py-2 px-4 hidden lg:table-cell">
                  {new Date(cls.startTime).toLocaleString()}
                </td>
                <td className="py-2 px-4 hidden lg:table-cell">
                  {new Date(cls.endTime).toLocaleString()}
                </td>
                <td className="py-2 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-sm font-semibold ${
                      cls.status === "live"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {cls.status}
                  </span>
                </td>
                <td className="py-2 px-4">
                  {cls.status === "live" ? (
                    <button
                      onClick={() => handleJoin(cls._id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                    >
                      Join
                    </button>
                  ) : (
                    <span className="text-gray-400 text-sm">N/A</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LiveClassTable;
