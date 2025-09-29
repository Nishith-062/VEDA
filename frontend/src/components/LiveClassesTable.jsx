import React from "react";
import { useNavigate } from "react-router-dom";

const LiveClassTable = ({ classes, loading }) => {
  const navigate = useNavigate();

  const handleJoin = (classId) => {
    navigate(`/student/live-class/${classId}`);
  };

  const renderSkeleton = () => {
    return Array(5)
      .fill(0)
      .map((_, idx) => (
        <tr key={idx} className="animate-pulse border-b">
          <td className="py-3 px-4 bg-gray-200 rounded h-6"></td>
          <td className="py-3 px-4 hidden sm:table-cell bg-gray-200 rounded h-6"></td>
          <td className="py-3 px-4 hidden md:table-cell bg-gray-200 rounded h-6"></td>
          <td className="py-3 px-4 hidden lg:table-cell bg-gray-200 rounded h-6"></td>
          <td className="py-3 px-4 hidden lg:table-cell bg-gray-200 rounded h-6"></td>
          <td className="py-3 px-4 bg-gray-200 rounded h-6"></td>
          <td className="py-3 px-4 bg-gray-200 rounded h-6"></td>
        </tr>
      ));
  };

  return (
    <div className="w-full">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto shadow-lg rounded-lg">
        <table className="min-w-full bg-white divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-medium">Title</th>
              <th className="py-3 px-4 text-left text-sm font-medium hidden sm:table-cell">Faculty</th>
              <th className="py-3 px-4 text-left text-sm font-medium hidden md:table-cell">Email</th>
              <th className="py-3 px-4 text-left text-sm font-medium hidden lg:table-cell">Start Time</th>
              <th className="py-3 px-4 text-left text-sm font-medium hidden lg:table-cell">End Time</th>
              <th className="py-3 px-4 text-left text-sm font-medium">Status</th>
              <th className="py-3 px-4 text-left text-sm font-medium">Join</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading
              ? renderSkeleton()
              : classes.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-6 text-gray-500">
                      No classes available
                    </td>
                  </tr>
                ) : (
                  classes.map((cls) => (
                    <tr
                      key={cls._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-2 px-4 font-medium">{cls.title}</td>
                      <td className="py-2 px-4 hidden sm:table-cell">{cls.faculty_id?.fullName || "N/A"}</td>
                      <td className="py-2 px-4 hidden md:table-cell">{cls.faculty_id?.email || "N/A"}</td>
                      <td className="py-2 px-4 hidden lg:table-cell">
                        {new Date(cls.startTime).toLocaleString()}
                      </td>
                      <td className="py-2 px-4 hidden lg:table-cell">
                        {new Date(cls.endTime).toLocaleString()}
                      </td>
                      <td className="py-2 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            cls.status === "live"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {cls.status}
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        {cls.status === "live" ? (
                          <button
                            onClick={() => handleJoin(cls._id)}
                            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm shadow"
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

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {loading
          ? Array(5)
              .fill(0)
              .map((_, idx) => (
                <div key={idx} className="animate-pulse p-4 bg-white shadow rounded-lg space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))
          : classes.length === 0 ? (
              <div className="text-center py-6 text-gray-500">No classes available</div>
            ) : (
              classes.map((cls) => (
                <div
                  key={cls._id}
                  className="p-4 bg-white shadow rounded-lg space-y-2"
                >
                  <h2 className="font-semibold text-lg">{cls.title}</h2>
                  <p className="text-gray-600">
                    Faculty: {cls.faculty_id?.fullName || "N/A"}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {cls.faculty_id?.email || "N/A"}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {new Date(cls.startTime).toLocaleString()} -{" "}
                    {new Date(cls.endTime).toLocaleString()}
                  </p>
                  <p>
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-semibold ${
                        cls.status === "live"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {cls.status}
                    </span>
                  </p>
                  {cls.status === "live" ? (
                    <button
                      onClick={() => handleJoin(cls._id)}
                      className="mt-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm shadow"
                    >
                      Join
                    </button>
                  ) : (
                    <span className="text-gray-400 text-sm">N/A</span>
                  )}
                </div>
              ))
            )}
      </div>
    </div>
  );
};

export default LiveClassTable;
