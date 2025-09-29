import React, { useEffect, useState } from "react";
import axios from "axios";
import LiveClassTable from "../components/LiveClassesTable";
import { useAuthStore } from "../store/useAuthStore";

const StudentLiveClasses = () => {
  const [classes, setClasses] = useState([]);
  const {token}=useAuthStore()
  console.log(token);
  

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get("https://veda-bj5v.onrender.com/api/live-class/schedule", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClasses(res.data.classes); // adjust according to backend
      } catch (error) {
        console.error("Error fetching classes:", error.response || error.message);
      }
    };

    // console.log(classes);
    

    fetchClasses();
  }, []);

  return (
    <div>
      <h1>Student Live Classes</h1>
      <LiveClassTable classes={classes} />
    </div>
  );
};

export default StudentLiveClasses;
