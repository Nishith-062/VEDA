/* eslint-disable no-restricted-globals */
import { precacheAndRoute, createHandlerBoundToURL } from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";
import { CacheFirst, NetworkFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";

// ✅ Precache build assets injected by Workbox
precacheAndRoute(self.__WB_MANIFEST);

// ✅ IndexedDB safety check — prevent UnknownError from crashing SW
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      try {
        // quick check: try opening a test db
        const req = indexedDB.open("SW-HealthCheck");
        req.onerror = () => {
          console.warn("⚠️ IndexedDB not available in this browser (maybe private mode).");
        };
        req.onsuccess = () => {
          req.result.close();
          indexedDB.deleteDatabase("SW-HealthCheck");
        };
      } catch (err) {
        console.warn("⚠️ IndexedDB initialization skipped:", err);
      }
    })()
  );
});

// ✅ Push Notifications
self.addEventListener("push", (event) => {
  let payload;
  if (event.data) {
    try {
      payload = event.data.json();
      console.log("📨 Push payload:", payload);
    } catch (error) {
      payload = {
        title: "Notification",
        body: event.data.text() || "New update available",
      };
    }
  }

  if (!payload?.title || !payload?.body) return;

  const options = {
    body: payload.body,
    icon: "/logo.png",
  };

  event.waitUntil(
    (async () => {
      try {
        await self.registration.showNotification(payload.title, options);
      } catch (err) {
        console.error("❌ showNotification failed:", err);
      }
    })()
  );
});

// ✅ Runtime caching: API (NetworkFirst)
try {
  registerRoute(
    ({ url }) =>
      url.origin === "https://veda-bj5v.onrender.com" &&
      url.pathname.startsWith("/api/lectures"),
    new NetworkFirst({
      cacheName: "api-lectures",
      networkTimeoutSeconds: 10,
      plugins: [
        new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 24 * 60 * 60 }), // 1 day
      ],
    })
  );
} catch (err) {
  console.warn("⚠️ Failed to register API cache route:", err);
}

// ✅ Runtime caching: Static resources (CacheFirst)
try {
  registerRoute(
    ({ request }) =>
      request.destination === "script" ||
      request.destination === "style" ||
      request.destination === "image",
    new CacheFirst({
      cacheName: "static-resources",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        }),
      ],
    })
  );
} catch (err) {
  console.warn("⚠️ Failed to register static cache route:", err);
}

// ✅ SPA navigation fallback: index.html
try {
  const handler = createHandlerBoundToURL("/index.html");
  const navigationRoute = new NavigationRoute(handler);
  registerRoute(navigationRoute);
} catch (err) {
  console.warn("⚠️ Navigation route registration failed:", err);
}

// ✅ Activate immediately after new SW install
self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
  console.log("✅ Service Worker active and controlling all clients.");
});
