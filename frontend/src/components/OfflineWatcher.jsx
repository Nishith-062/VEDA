import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const OfflineWatcher = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      navigate("/offline-downloads"); // auto redirect
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [navigate]);

  return null; // nothing to render
};

export default OfflineWatcher;
