import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    base: "/", // ensure correct base path
  server: {
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      srcDir:'src',
      filename:'sw.js',
      strategies: "injectManifest",
      injectManifest:{
        swSrc:'src/sw.js',
        swDest:'dist/sw.js'
      },
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
        enabled: false,
        type:'module'
      }
    }),
  ],
});
