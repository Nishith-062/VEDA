import { useState, useEffect } from "react";
import {
  Loader,
  Wifi,
  Download,
  Globe,
  GraduationCap,
  Bot,
  Headphones,
} from "lucide-react";

const LoadingScreen = () => {
  const features = [
    {
      icon: <Headphones className="w-8 h-8" />,
      title: "Audio First Learning",
      desc: "90% less data than video streaming",
    },
    {
      icon: <Wifi className="w-8 h-8" />,
      title: "Works on Weak Networks",
      desc: "Optimized for 3G connectivity",
    },
    {
      icon: <Download className="w-8 h-8" />,
      title: "Offline Access",
      desc: "Download once, learn anytime, anywhere",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Hindi UI Support",
      desc: "Learn comfortably in your native language",
    },
    {
      icon: <GraduationCap className="w-8 h-8" />,
      title: "Teacher Friendly",
      desc: "Simple interface for non-tech teachers",
    },
    {
      icon: <Bot className="w-8 h-8" />,
      title: "AI Assistant",
      desc: "24/7 instant help and guidance",
    },
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [features.length]);

  return (
    <div className="relative flex flex-col items-center justify-center w-full min-h-screen overflow-hidden">
      {/* Animated Background Elements */}


      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center px-6 max-w-2xl">
        {/* Logo/Title Section */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-2">VEDA</h1>
          <p className="text-gray-600 text-lg font-medium">
            Virtual Education Delivery Assistant
          </p>
        </div>

        {/* Loading Spinner */}
        <div className="relative mb-8">
          <Loader
            className="relative animate-spin w-12 h-12 text-blue-800"
            strokeWidth={2.5}
          />
        </div>

        {/* Deployment Notice */}
        <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl px-6 py-4 mb-8 shadow-lg">
          <p className="text-sm text-gray-700 leading-relaxed">
            <span className="font-semibold text-blue-800">⏳ First Load Notice:</span>{" "}
            The app is deployed on{" "}
            <span className="font-bold text-blue-800">Vercel</span>{" "}
            (frontend) and{" "}
            <span className="font-bold text-blue-800">Render</span>{" "}
            (backend). Initial loading may take 30-60 seconds.
          </p>
        </div>

        {/* Feature Card */}
        <div className="w-full mb-6">
          <div
            key={index}
            className="bg-white rounded-2xl shadow-md p-6 text-center transition-all duration-500 border border-gray-100"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-xl text-blue-600 mb-3">
              {features[index].icon}
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {features[index].title}
            </h2>
            <p className="text-gray-600 text-sm">{features[index].desc}</p>
          </div>
        </div>

        {/* Feature Dots */}
        <div className="flex gap-2 mb-6">
          {features.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-6 bg-blue-600" : "w-1.5 bg-gray-300"
              }`}
            ></div>
          ))}
        </div>

        {/* Footer Message */}
        <div className="text-center space-y-2">
          <p className="text-gray-500 text-sm font-medium animate-pulse">
            Preparing your learning experience...
          </p>
          <p className="text-gray-400 text-xs">
            Bridging the digital divide in education
          </p>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
