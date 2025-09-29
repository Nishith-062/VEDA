import React, { use, useEffect } from "react";

const Admin = () => {
  const [lectures, setLectures] = React.useState([]);

  const Students=[
    {name:"student",downloaded:"20MB"}
    ,{name:"stu",downloaded:"10MB"},{name:"student2",downloaded:"1.7MB"}
  ]

  const teachers=[
    {name:"teacher",total_classes:2,uploaded:"30MB"}
    ,{name:"tea",total_classes:3,uploaded:"23MB"},{name:"teacher2",total_classes:4,uploaded:"12MB"}
  ]

  const fetchData = async () => {
    const response = await fetch("https://veda-bj5v.onrender.com/api/lectures");
    const data = await response.json();
    // console.log(data);
    setLectures(data.data);
  };

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div>
      <h1 className="text-3xl font-bold text-center mb-4">Admin Dashboard</h1>
      <div className="flex flex-col gap-4">
        
        <div className="overflow-x-auto">
            <h1 className="text-center text-xl">Lecture Information</h1>
          <table className="table-fixed min-w-full border border-gray-200 rounded-xl shadow-sm">
            <thead>
              <tr className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                  S.No
                </th>

                <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                  Orignal size
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                  Compressed Size
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {lectures.map((lecture, index) => (
                <tr key={index} className="hover:bg-indigo-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {lecture.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {lecture.originalSize.toFixed(2)} MB
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {lecture.compressedSize.toFixed(2)} MB
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-4">

            {/* student info */}
            <div>
                <h1 className="text-center text-xl">Student Information</h1>
          <table className="table-fixed border w-2xl border-gray-200 rounded-xl shadow-sm">
            <thead>
              <tr className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                  S.No
                </th>

                <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                    student
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                    Downloaded
                </th>

              </tr>
            </thead>
            <tbody className="divide-y w-full divide-gray-200">
                {Students.map((student,index)=>(
                <tr key={index} className="hover:bg-indigo-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {   index+1}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {student.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {student.downloaded}
                  </td>

                </tr>))}
            </tbody>
          </table>

          </div>
            {/* teacher info */}

            <div className="">
                <h1 className="text-center text-xl">Faculty Information</h1>
          <table className="table-fixed border w-2xl border-gray-200 rounded-xl shadow-sm">
            <thead>
              <tr className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                  S.No
                </th>

                <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                    Total Classes
                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                    Uploaded
                </th>

              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                {teachers.map((teacher,index)=>(
                <tr key={index} className="hover:bg-indigo-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {teacher.name}  
                  </td> 
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {teacher.total_classes}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {teacher.uploaded}
                  </td>

                </tr>))}
            </tbody>
          </table>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Admin;
