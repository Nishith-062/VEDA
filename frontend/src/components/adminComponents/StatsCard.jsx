const StatsCard = ({ title, value, icon }) => {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-1">{value}</h3>
        </div>
        <div className="p-3 rounded-lg bg-indigo-50">{icon}</div>
      </div>
    </div>
  );
};
export default StatsCard;
