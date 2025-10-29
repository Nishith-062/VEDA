import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";
import { GraduationCap, Users, BookOpen, Plus } from "lucide-react";
import toast from "react-hot-toast";
import StatsCard from "../components/adminComponents/StatsCard";
import DepartmentCard from "../components/adminComponents/DepartmentCard";
import CreateDepartmentModal from "../components/adminComponents/CreateDepartmentModal";

const BASE_URL = "http://localhost:3000/api/admin";

const AdminDashboard = () => {
  const { token } = useAuthStore();
  const [isModalOpen, setModalOpen] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/departments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDepartments(response.data.departments || []);
      } catch (error) {
        console.error("Failed to fetch departments:", error);
        toast.error("Could not fetch departments.");
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      fetchDepartments();
    }
  }, [token]);

  const handleCreate = async (data) => {
    const toastId = toast.loading("Creating department...");
    try {
      const response = await axios.post(`${BASE_URL}/departments`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDepartments([...departments, response.data.department]);
      setModalOpen(false);
      toast.success("Department created successfully!", { id: toastId });
    } catch (error) {
      console.error("Error creating department:", error);
      toast.error(
        error.response?.data?.message || "Failed to create department.",
        { id: toastId }
      );
    }
  };

  
  const totalStudents = departments.reduce(
    (a, b) => a + (b.totalStudents || 0),
    0
  );
  const totalFaculty = departments.reduce(
    (a, b) => a + (b.totalFaculty || 0),
    0
  );
  console.log(departments);
  
  const totalDepartments = departments.length;
  console.log("Departments:", totalStudents, totalFaculty, totalDepartments);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 p-2.5">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                College Admin
              </h1>
              <p className="text-sm text-gray-500">Management Dashboard</p>
            </div>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            // ✨ UPDATED CLASSNAME FOR HOVER EFFECT
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white shadow-md transition-all duration-300 ease-in-out hover:-translate-y-1 hover:bg-indigo-700 hover:shadow-lg"
          >
            <Plus className="h-4 w-4" />
            New Department
          </button>

          <CreateDepartmentModal
            isOpen={isModalOpen}
            onClose={() => setModalOpen(false)}
            onCreate={handleCreate}
          />
        </div>
      </header>

      {/* Stats Cards */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid gap-6 md:grid-cols-3 mb-12">
          <StatsCard
            title="Total Departments"
            value={totalDepartments}
            icon={<BookOpen className="h-6 w-6 text-indigo-600" />}
          />
          <StatsCard
            title="Total Students"
            value={totalStudents}
            icon={<Users className="h-6 w-6 text-indigo-600" />}
          />
          <StatsCard
            title="Total Faculty"
            value={totalFaculty}
            icon={<GraduationCap className="h-6 w-6 text-indigo-600" />}
          />
        </div>

        {/* Departments Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Departments
          </h2>
          <p className="text-gray-500 mb-6">
            Manage departments, faculty, students, and courses
          </p>

          {loading ? (
            <p className="text-center text-gray-500">Loading departments...</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {departments.map((dept) => (
                <DepartmentCard key={dept._id} dept={dept} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;