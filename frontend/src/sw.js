// src/sw.js

import { precacheAndRoute, createHandlerBoundToURL } from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";
import { CacheFirst, NetworkFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";

// ✅ Precache build assets injected by Workbox
precacheAndRoute(self.__WB_MANIFEST);

// ✅ Push Notifications
self.addEventListener("push", (event) => {
  let payload;
  if (event.data) {
    try {
      payload = event.data.json();
      console.log("push", payload);
    } catch (error) {
      payload = {
        title: "Notification",
        body: event.data.text() || "nothing",
      };
    }
  }

  if (!payload?.title || !payload?.body) return;

  const options = {
    body: payload.body,
    icon: "/logo.png", // place a logo.png in public/
  };

event.waitUntil((async () => {
  try {
    console.log("📨 Showing notification:", payload);
    await self.registration.showNotification(payload.title, options);
  } catch (err) {
    console.error("❌ showNotification failed:", err);
  }
})());


});

// ✅ Runtime caching: API (NetworkFirst)
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

// ✅ Runtime caching: Static resources (CacheFirst)
registerRoute(
  ({ request }) =>
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "image",
  new CacheFirst({
    cacheName: "static-resources",
    plugins: [
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 }), // 30 days
    ],
  })
);

// ✅ SPA navigation fallback: index.html
const handler = createHandlerBoundToURL("/index.html");
const navigationRoute = new NavigationRoute(handler);
registerRoute(navigationRoute);
