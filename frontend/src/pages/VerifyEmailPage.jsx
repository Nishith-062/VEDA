import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await axios.get(`https://veda-bj5v.onrender.com/api/user/verify/${token}`, {
          withCredentials: true, // 🔑 important for cookies (JWT)
        });
        console.log(res.data);
        setStatus("success");

        // Wait 2 seconds, then redirect
        setTimeout(() => navigate("/"), 2000);
      } catch (err) {
        console.error(err.response?.data || err.message);
        setStatus("error");
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white px-4">
      {status === "loading" && (
        <>
          <Loader2 className="animate-spin w-12 h-12 text-blue-400 mb-4" />
          <p>Verifying your email, please wait...</p>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle className="w-12 h-12 text-green-400 mb-4" />
          <h1 className="text-xl font-semibold mb-2">
            Email Verified Successfully 🎉
          </h1>
          <p className="text-gray-400">
            Redirecting you to your dashboard...
          </p>
        </>
      )}

      {status === "error" && (
        <>
          <XCircle className="w-12 h-12 text-red-400 mb-4" />
          <h1 className="text-xl font-semibold mb-2">Verification Failed</h1>
          <p className="text-gray-400 mb-4">
            Your link might be expired or invalid.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 bg-blue-500 rounded-md hover:bg-blue-600 transition"
          >
            Go to Login
          </button>
        </>
      )}
    </div>
  );
};

export default VerifyEmailPage;
