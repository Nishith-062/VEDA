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
          withCredentials: true,
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
    <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white px-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-8 text-center transition-all duration-300">
        {status === "loading" && (
          <>
            <Loader2 className="animate-spin w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">Verifying Your Email</h1>
            <p className="text-gray-400">Please wait while we confirm your verification...</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">Email Verified Successfully 🎉</h1>
            <p className="text-gray-400 mb-4">Redirecting you to your dashboard...</p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">Verification Failed</h1>
            <p className="text-gray-400 mb-6">
              This link may be invalid, expired, or has already been verified.
              Please check your email for the original verification link and try again.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition-colors"
            >
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
