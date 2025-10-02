import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  server: {
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: "generateSW",
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "index.html", "logo.jpg"],
      manifest: {
        name: "Virtual Education Delivery Assistant",
        short_name: "VEDA",
        description: "Learning Progressive Web Apps",
        theme_color: "#f43131ff",
        background_color: "#ea6363ff",
        display: "standalone",
        scope: "/",
        start_url: "/",                 // <- IMPORTANT: root, not /offline-downloads
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      devOptions: {
        enabled: true,
      },
      workbox: {
        // Serve the app shell (index.html) for navigation requests (SPA)
        navigateFallback: "/index.html",
        // Keep globPatterns so index.html and assets are precached
        globPatterns: ["**/*.{js,css,html,png,svg,woff2,ico}"],

        // runtime caching unchanged; keep your existing policies:
        runtimeCaching: [
          {
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
