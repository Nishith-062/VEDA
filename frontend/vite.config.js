import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";

// ...existing code...
export default defineConfig({
  server: {
    proxy: {
      "/api": "https://veda-bj5v.onrender.com",
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
        strategies: "generateSW", // not injectManifest

      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "index.html", "logo.jpg"], // cache offline page
      manifest: {
        name: "Virtual Education Delivery Assistant",
        short_name: "VEDA",
        description: "Learning Progressive Web Apps",
        theme_color: "#f43131ff",
        background_color: "#ea6363ff",
        display: "standalone",
        scope: "/",
        start_url: "/offline-downloads",
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      devOptions:{
        enabled:true
      },
      workbox: {
        additionalManifestEntries: [
    { url: "/offline-downloads", revision: null }, // 👈 add this
        ],
        // When navigation fails (offline), serve offline.html so the app can boot and read IndexedDB
        navigateFallback: "/offline-downloads",
        globPatterns: ["**/*.{js,css,html,png,svg,woff2,ico}"],
        runtimeCaching: [
          {
            // Cache lectures list / videos API
            urlPattern: /^https:\/\/veda-bj5v\.onrender\.com\/api\/lectures/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-lectures",
              expiration: { maxEntries: 30, maxAgeSeconds: 24 * 60 * 60 },
              networkTimeoutSeconds: 10,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Cache static resources
            urlPattern: ({ request }) =>
              request.destination === "script" ||
              request.destination === "style" ||
              request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "static-resources",
              expiration: { maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
        ],
      },
    }),
  ],
});
 // ...existing code...
