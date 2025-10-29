import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
// Updated to use simple, clean icons suitable for a professional look
import { Check, X, Loader2, Shield, Mail } from "lucide-react"; 

// --- Helper Components for Light Theme Layout ---

// A consistent card for all statuses
const ProfessionalStatusCard = ({ icon: Icon, iconColor, title, message, actionButton }) => (
  <div className="w-full max-w-lg bg-white border border-gray-200 rounded-xl shadow-2xl p-10 md:p-12 text-center transition-all duration-300">
    
    {/* Icon Container with a colored ring and background for focus */}
    <div className="flex justify-center items-center mb-6">
      <div className={`p-4 rounded-full ${iconColor} bg-opacity-10 ring-2 ${iconColor.replace('text', 'ring')}-500/20`}>
        <Icon className="w-8 h-8" />
      </div>
    </div>
    
    <h1 className="text-2xl font-bold text-gray-800 mb-3 tracking-wide">{title}</h1>
    <p className="text-gray-600 mb-8 leading-relaxed">{message}</p>
    
    {actionButton}
  </div>
);

// A clean, primary action button
const PrimaryButton = ({ onClick, children }) => (
  <button
    onClick={onClick}
    className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
  >
    {children}
  </button>
);

// --- Main Component (Functionality Unchanged) ---

const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/user/verify/${token}`,
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
          setTimeout(() => navigate("/"), 3000); 
        }
      } catch (err) {
        console.error(err.response?.data || err.message);
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
          "Invalid or expired verification link. Please check your email or request a new link."
        );
      }
    };

    verifyEmail();
  }, [token, navigate]);

  let content;

  switch (status) {
    case "loading":
      content = (
        <ProfessionalStatusCard
          icon={Loader2}
          iconColor="text-blue-600"
          title="Verifying Account"
          message="Please wait while we process your secure verification request. This may take a moment..."
          actionButton={<Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500/50" />}
        />
      );
      break;

    case "success":
      content = (
        <ProfessionalStatusCard
          icon={Check}
          iconColor="text-green-600"
          title="Verification Successful"
          message="Your email has been successfully verified. You are now being redirected to your dashboard."
          actionButton={
            <PrimaryButton onClick={() => navigate("/")}>
              Continue to Dashboard
            </PrimaryButton>
          }
        />
      );
      break;

    case "alreadyVerified":
      content = (
        <ProfessionalStatusCard
          icon={Shield}
          iconColor="text-yellow-600"
          title="Account Already Active"
          message="This account is already verified. You may proceed directly to the login page."
          actionButton={
            <PrimaryButton onClick={() => navigate("/login")}>
              Go to Login
            </PrimaryButton>
          }
        />
      );
      break;

    case "error":
      content = (
        <ProfessionalStatusCard
          icon={X}
          iconColor="text-red-600"
          title="Verification Failed"
          message={message}
          actionButton={
            <PrimaryButton onClick={() => navigate("/login")}>
              Go to Login
            </PrimaryButton>
          }
        />
      );
      break;

    default:
      content = null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen **bg-gray-50** p-4">
      {content}
    </div>
  );
};

export default VerifyEmailPage;