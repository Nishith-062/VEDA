// src/serviceWorkerRegistration.js
import { registerSW } from "virtual:pwa-register";

export function registerServiceWorker() {
  // returns a function you can call to update the SW programmatically
  const updateSW = registerSW({
    onNeedRefresh() {
      // optionally prompt the user that a new version is available
      console.log("New content available — please refresh.");
    },
    onOfflineReady() {
      console.log("App ready to work offline.");
    },
  });

  return updateSW;
}
