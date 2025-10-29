import { Plus, Trash2 } from "lucide-react";

export default function DepartmentTabSection({
  title,
  data,
  type,
  onAdd,
  onDelete,
}) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg 
                     hover:bg-indigo-700 hover:shadow-md hover:scale-[1.02]
                     transition-all duration-300 ease-in-out"
        >
          <Plus size={18} /> Add {type}
        </button>
      </div>

      {/* Content */}
      {data && data.length > 0 ? (
        <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-4">
          {data.map((item) => (
            <div
              key={item._id}
              className="bg-gray-50 rounded-xl border border-gray-200 p-4 flex flex-col gap-2 
                         hover:border-indigo-400/70 hover:shadow-md hover:scale-[1.02] 
                         transition-all duration-300 ease-in-out"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {item.fullName || item.name || item.course_name}
                  </h3>
                  {item.course_name && item.description && (
                    <p className="text-sm text-gray-500">{item.description}</p>
                  )}
                  {item.email && (
                    <p className="text-sm text-gray-500">{item.email}</p>
                  )}
                </div>
                {!item.course_name && <button
                  onClick={() => onDelete(type, item._id)}
                  className="text-red-500 hover:text-red-600 transition-colors duration-200"
                >
                  <Trash2 size={18} />
                </button>}
              </div>
              <span className="text-xs text-indigo-700 bg-indigo-100 px-2 py-1 rounded-full w-fit">
                {type}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm text-center py-6">
          No {type.toLowerCase()}s found.
        </p>
      )}
    </div>
  );
}
