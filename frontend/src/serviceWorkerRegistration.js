// ...existing code...
// Minimal SW registration wrapper using VitePWA virtual helper
import { registerSW } from "virtual:pwa-register";

export function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    // register and auto-update
    const update = registerSW({
      onNeedRefresh() {
        // you can show a toast to user to reload
        console.log("SW update available");
      },
      onOfflineReady() {
        console.log("App is ready to work offline");
      },
    });
    return update;
  }
  return null;
}