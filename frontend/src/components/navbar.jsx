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
    // If the event was already captured by the early listener, use it
    if (window.__deferredPwaPrompt) {
      setDeferredPrompt(window.__deferredPwaPrompt);
      // Only show modal if app isn't already installed
      const isStandalone =
        window.matchMedia && window.matchMedia("(display-mode: standalone)").matches;
      if (!isStandalone && !navigator.standalone) {
        setShowInstallModal(true);
      }
    }

    // Listen for the custom signal when the prompt becomes available
    const onAvailable = () => {
      setDeferredPrompt(window.__deferredPwaPrompt);
      const isStandalone =
        window.matchMedia && window.matchMedia("(display-mode: standalone)").matches;
      if (!isStandalone && !navigator.standalone) {
        setShowInstallModal(true);
      }
    };
    const onInstalled = () => {
      setDeferredPrompt(null);
      setShowInstallModal(false);
    };

    window.addEventListener("pwa-install-available", onAvailable);
    window.addEventListener("pwa-installed", onInstalled);

    return () => {
      window.removeEventListener("pwa-install-available", onAvailable);
      window.removeEventListener("pwa-installed", onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    const promptEvent = deferredPrompt || window.__deferredPwaPrompt;
    if (!promptEvent) return;
    // Show the browser prompt
    promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === "accepted") {
      console.log("PWA installed");
    } else {
      console.log("PWA dismissed");
    }
    // Clear saved event so we don't attempt to reuse it
    window.__deferredPwaPrompt = null;
    setDeferredPrompt(null);
    setShowInstallModal(false);
  };

  const handleDismiss = () => setShowInstallModal(false);

  // ...existing render code (logo, user dropdown, etc.)...

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      {/* ... your current navbar JSX ... */}

      {/* Install Modal */}
      {showInstallModal && deferredPrompt && (
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
