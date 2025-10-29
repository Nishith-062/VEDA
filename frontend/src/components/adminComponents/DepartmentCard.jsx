import { Users, GraduationCap, BookOpen, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DepartmentCard = ({ dept }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/admin/departments/${dept._id}`)}
      className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm 
                 hover:shadow-md hover:scale-[1.02] hover:border-indigo-400/70 
                 transition-all duration-300 ease-in-out cursor-pointer"
    >
      <h3 className="text-lg font-semibold text-gray-900">{dept.name}</h3>
      <p className="text-sm text-gray-600 mt-1 mb-5">{dept.description}</p>

      <div className="space-y-2 mb-5">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Users className="h-4 w-4 text-indigo-500" />
          <span>{dept.totalStudents} Students</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <GraduationCap className="h-4 w-4 text-purple-500" />
          <span>{dept.totalFaculty} Faculty</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <BookOpen className="h-4 w-4 text-green-500" />
          <span>{dept.totalCourses} Courses</span>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation(); // prevents parent onClick trigger
          navigate(`/admin/departments/${dept._id}`);
        }}
        className="cursor-pointer flex items-center justify-between w-full 
                   bg-indigo-50 text-indigo-700 font-medium text-sm 
                   px-4 py-2 rounded-lg transition-all duration-300 ease-in-out
                   hover:bg-indigo-100 hover:text-indigo-800"
      >
        View Details
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default DepartmentCard;
