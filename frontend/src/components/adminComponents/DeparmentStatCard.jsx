export default function DepartmentStatCard({ icon, label, count }) {
  return (
    <div
      className="flex items-center gap-2 bg-white shadow-sm rounded-xl 
                 px-4 py-3 w-fit border border-gray-200 
                 hover:border-indigo-400/70 hover:shadow-md hover:scale-[1.02]
                 transition-all duration-300 ease-in-out cursor-pointer"
    >
      <div className="text-indigo-600">{icon}</div>
      <span className="font-medium text-gray-700">
        {count || 0} {label}
      </span>
    </div>
  );
}
