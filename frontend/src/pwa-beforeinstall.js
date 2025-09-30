// src/pwa-beforeinstall.js
// Import this from main.jsx before React renders so you don't miss the event.

export function initPwaInstallListener() {
  // keep a global ref and notify the app via a custom event
  window.__deferredPwaPrompt = null;

  window.addEventListener("beforeinstallprompt", (e) => {
    // Prevent automatic Chrome prompt
    e.preventDefault();
    // Save it for later (so UI can call prompt())
    window.__deferredPwaPrompt = e;

    // Notify the app (Navbar or any listener) that an install prompt is available
    window.dispatchEvent(new CustomEvent("pwa-install-available"));
  });

  // Clear it when app is installed
  window.addEventListener("appinstalled", () => {
    window.__deferredPwaPrompt = null;
    window.dispatchEvent(new CustomEvent("pwa-installed"));
  });
}
