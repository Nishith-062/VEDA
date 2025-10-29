import axios from "axios";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import {
  Users,
  GraduationCap,
  BookOpen,
  Home,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import DeparmentStatCard from "../../components/adminComponents/DeparmentStatCard";
import DeparmentTabSection from "../../components/adminComponents/DeparmentTabSection";
import DepartmentModal from "../../components/adminComponents/DepartmentModal";

export default function DepartmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("students");
  const [department, setDepartment] = useState(null);
  const { token } = useAuthStore();

  const [showModal, setShowModal] = useState(false);
  const [formType, setFormType] = useState(""); // "Student" | "Faculty" | "Course"
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    course_name: "",
    description: "",
  });

  // ✅ Fetch department details
  const fetchDepartment = async () => {
    try {
      const res = await axios.get(`/api/admin/departments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDepartment(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDepartment();
  }, [id]);

  // ✅ Add Student / Faculty / Course
  const handleAdd = async () => {
    try {
      let url;
      const payload = { ...formData, department_id: id };

      if (formType === "Student") url = "/api/admin/students";
      if (formType === "Faculty") url = "/api/admin/faculty";
      if (formType === "Course") url = "/api/admin/courses";

      await axios.post(url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowModal(false);
      setFormData({
        fullName: "",
        email: "",
        password: "",
        course_name: "",
        description: "",
      });
      fetchDepartment(); // refresh data
      toast.success(`${formType} added successfully`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add");
    }
  };

  // ✅ Delete Student / Faculty / Course
  const handleDelete = async (type, itemId) => {
    try {
      let url;
      if (type === "Student") url = `/api/admin/students/${itemId}`;
      if (type === "Faculty") url = `/api/admin/teachers/${itemId}`;

      await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDepartment();
      toast.success(`${type} deleted successfully`);
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  if (!department)
    return <p className="p-6 text-gray-500 text-center">Loading...</p>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            {/* The header icon already uses a matching color, so no change is needed here */}
            <GraduationCap className="text-indigo-600" size={32} />
            {department.name}
          </h1>
          <p className="text-gray-500 mt-1">{department.description}</p>
        </div>
        <button
          onClick={() => navigate("/admin")}
          className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition cursor-pointer"
        >
          <Home size={18} /> Back to Home
        </button>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-4 mb-8">
        {/* ✨ Changed color of the icons passed to the Stat Card */}
        <DeparmentStatCard
          icon={<Users className="text-orange-500" />}
          label="Students"
          count={department.students?.length}
        />
        <DeparmentStatCard
          icon={<GraduationCap className="text-indigo-600" />}
          label="Faculty"
          count={department.faculty?.length}
        />
        <DeparmentStatCard
          icon={<BookOpen className="text-purple-600" />}
          label="Courses"
          count={department.courses?.length}
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        {["students", "faculty", "courses"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 font-medium capitalize border-b-2 transition cursor-pointer ${
              activeTab === tab
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "students" && (
        <DeparmentTabSection
          title="Students"
          data={department.students}
          type="Student"
          onAdd={() => {
            setFormType("Student");
            setShowModal(true);
          }}
          onDelete={handleDelete}
        />
      )}

      {activeTab === "faculty" && (
        <DeparmentTabSection
          title="Faculty"
          data={department.faculty}
          type="Faculty"
          onAdd={() => {
            setFormType("Faculty");
            setShowModal(true);
          }}
          onDelete={handleDelete}
        />
      )}

      {activeTab === "courses" && (
        <DeparmentTabSection
          title="Courses"
          data={department.courses}
          type="Course"
          onAdd={() => {
            setFormType("Course");
            setShowModal(true);
          }}
          onDelete={handleDelete}
        />
      )}

      {/* Modal */}
      {showModal && (
        <DepartmentModal
          type={formType}
          formData={formData}
          setFormData={setFormData}
          onClose={() => setShowModal(false)}
          onSubmit={handleAdd}
        />
      )}
    </div>
  );
}