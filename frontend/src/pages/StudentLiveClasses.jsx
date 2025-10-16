import React, { useEffect, useState } from "react";
import axios from "axios";
import LiveClassTable from "../components/LiveClassesTable";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import LiveaudioClasstable from "../components/LiveAudioClassesTable";

const StudentLiveClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true); // new loading state
  const [loadingClasses,setLoadingClasses]=useState(false);
  const [Audioclasses,setAudioClasses]=useState([]);
  const { token } = useAuthStore();
  const navigate=useNavigate()
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          "https://veda-bj5v.onrender.com/api/live-class/schedule",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setClasses(res.data.classes || []); // ensure it's an array
      } catch (error) {
        console.error("Error fetching classes:", error.response || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [token]);

  // Fetching Audio Classes;
  useEffect(()=>{
    const fetcheAudioClasses=async()=>{
      setLoadingClasses(true);  
      try{
              const res = await axios.get(
          "http://localhost:3000/api/Audioclass-live/scheduleAudio",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAudioClasses(res.data.classes || []);
          console.log(Audioclasses);
         }catch(e){
             console.error("Error fetching classes:", error.response || error.message);
         }
         finally{
               setLoadingClasses(false);
         } 
    }
    fetcheAudioClasses();
  },[token]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
  <button
        className="bg-blue-600 p-1.5 rounded-sm cursor-pointer text-white mb-4"
        onClick={() => {
          navigate("/student");
        }}
      >
        Back
      </button>      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Student Live Classes
      </h1>
      <LiveClassTable classes={classes} loading={loading} />
      <h1>Audio + Slide Synchronization Live classes</h1>
      <LiveaudioClasstable classes={Audioclasses} loadingClasses={loadingClasses}/>
    </div>
  );
};

export default StudentLiveClasses;
