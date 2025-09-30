import React, { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import Online from "./Online";
import Languageselector from "../pages/Languageselector";

const Navbar = ({ authUser }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault(); // Stop automatic browser popup
      setDeferredPrompt(e);

      // Show our custom modal if app not installed
      if (window.matchMedia("(display-mode: browser)").matches) {
        setShowInstallModal(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      console.log("PWA installed");
    } else {
      console.log("PWA dismissed");
    }
    setShowInstallModal(false);
  };

  const handleDismiss = () => setShowInstallModal(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left - Logo + Brand */}
          <div className="flex items-center gap-2">
            <img
              src="/logo.jpg"
              alt="VEDA"
              className="h-9 w-9 rounded-md object-cover"
            />
            <span className="text-lg font-semibold text-gray-800">VEDA</span>
          </div>

          {/* Right - User Dropdown + Other items */}
          <div className="flex items-center gap-2">
            <Online />
            <Languageselector />

            {/* User Dropdown */}
            <div className="relative">
              {authUser ? (
                <>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-800 text-sm font-medium px-3 py-2 rounded-lg transition"
                  >
                    <span>{authUser.fullName}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 transition-transform ${
                        dropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-md shadow-md py-1 flex flex-col">
                      <button
                        onClick={() => {
                          useAuthStore.getState().logout();
                          setDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <span className="text-gray-600 text-sm">Not Logged In</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Install Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80 text-center">
            <h2 className="text-lg font-semibold mb-4">Install VEDA App</h2>
            <p className="text-sm mb-6">
              Install this app on your device for a better experience.
            </p>
            <div className="flex justify-around gap-4">
              <button
                onClick={handleInstall}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
