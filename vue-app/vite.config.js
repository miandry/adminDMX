import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/drupal/transaction.local/",
  plugins: [
    vue(),
    VitePWA({
      registerType: "manual",
      strategies: "generateSW",
      filename: "sw.js",
      navigateFallback: null,
      manifest: {
        name: "Drupal Vue PWA",
        short_name: "VuePWA",
        start_url: "/drupal/transaction.local/",
        scope: "/drupal/transaction.local/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#0f172a",
      },

      workbox: {
        globPatterns: ["themes/adminDMX/dist/**/*.{js,css,webmanifest}"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: null,
        runtimeCaching: [
          // 🔹 CDN CSS / JS
          {
            urlPattern:
              /^https:\/\/(cdn\.tailwindcss\.com|cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)\//,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "cdn-assets",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 jours
              },
              cacheableResponse: {
                statuses: [0, 200], // 0 = opaque response (CDN)
              },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === "document",
            handler: "NetworkFirst",
            options: {
              cacheName: "pages",
            },
          },
          {
            urlPattern: ({ request }) =>
              ["style", "script", "worker"].includes(request.destination),
            handler: "CacheFirst",
            options: {
              cacheName: "assets",
            },
          },
        ],
      },
    }),
  ],
  build: {
    outDir: resolve(__dirname, "../dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, "src/main.js"),
      output: {
        entryFileNames: "app.js",
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },
});
