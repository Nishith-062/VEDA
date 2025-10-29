import {X} from 'lucide-react'
export default function DepartmentModal({ type, formData, setFormData, onClose, onSubmit }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-[400px] relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Add {type}
        </h2>

        <div className="space-y-3">
          {type !== "Course" && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="w-full border p-2 rounded-lg"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full border p-2 rounded-lg"
              />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full border p-2 rounded-lg"
              />
            </>
          )}

          {type === "Course" && (
            <>
              <input
                type="text"
                placeholder="Course Name"
                value={formData.course_name}
                onChange={(e) =>
                  setFormData({ ...formData, course_name: e.target.value })
                }
                className="w-full border p-2 rounded-lg"
              />
              <textarea
                placeholder="Course Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full border p-2 rounded-lg"
              />
            </>
          )}
        </div>

        <button
          onClick={onSubmit}
          className="w-full mt-5 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
        >
          Add {type}
        </button>
      </div>
    </div>
  );
}