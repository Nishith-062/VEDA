import { BookOpen, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CourseCard({
  title,
  description,
  instructor,
  courseId,
}){

const navigate=useNavigate()


  return (
    <div className="w-[360px] bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 text-center">
      {/* Icon */}
      <div className="bg-indigo-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
        <BookOpen className="text-indigo-600 w-6 h-6" />
      </div>

      {/* Course Title */}
      <h2 className="text-lg font-semibold text-gray-900">
        {title}
      </h2>

      {/* Description */}
      <p className="text-gray-500 text-sm mt-1 mb-4">
        {description}
      </p>

      {/* Instructor */}
      <div className="flex items-center justify-center text-gray-700 text-sm mb-6">
        <User className="w-4 h-4 mr-2 text-gray-500" />
        <span>{instructor}</span>
      </div>

      {/* Button */}
      <button
        className="w-full bg-indigo-600 text-white font-medium py-2.5 rounded-lg hover:bg-indigo-700 transition-colors"
        onClick={()=>navigate(`/student/lectures/${courseId}`)}
      >
        View Lectures
      </button>
    </div>
  );}

