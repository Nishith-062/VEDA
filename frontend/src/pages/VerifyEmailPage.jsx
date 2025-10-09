import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { CheckCircle, XCircle, Loader2, ShieldCheck } from "lucide-react";

const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await axios.get(
          `https://veda-bj5v.onrender.com/api/user/verify/${token}`,
          { withCredentials: true }
        );
        console.log(res.data);

        const msg = res.data?.message?.toLowerCase() || "";

        if (msg.includes("already verified")) {
          setStatus("alreadyVerified");
          setMessage(res.data.message);
        } else {
          setStatus("success");
          setMessage(res.data.message || "Email verified successfully!");
          setTimeout(() => navigate("/"), 2000);
        }
      } catch (err) {
        console.error(err.response?.data || err.message);
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
            "Invalid or expired verification link."
        );
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white px-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-8 text-center transition-all duration-300">
        {/* Loading */}
        {status === "loading" && (
          <>
            <Loader2 className="animate-spin w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">Verifying Your Email</h1>
            <p className="text-gray-400">
              Please wait while we confirm your verification...
            </p>
          </>
        )}

        {/* Success */}
        {status === "success" && (
          <>
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">
              Email Verified Successfully 🎉
            </h1>
            <p className="text-gray-400 mb-4">Redirecting you to dashboard...</p>
          </>
        )}

        {/* Already Verified */}
        {status === "alreadyVerified" && (
          <>
            <ShieldCheck className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">Email Already Verified</h1>
            <p className="text-gray-400 mb-6">
              Your account is already verified. You can log in directly.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition-colors"
            >
              Go to Login
            </button>
          </>
        )}

        {/* Error */}
        {status === "error" && (
          <>
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">Verification Failed</h1>
            <p className="text-gray-400 mb-6">{message}</p>
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
