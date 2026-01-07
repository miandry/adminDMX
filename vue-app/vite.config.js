import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/",
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      strategies: "generateSW",
      injectRegister: false,
      manifest: {
        name: "Drupal Vue PWA",
        short_name: "VuePWA",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#0f172a",
      },

      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,

        runtimeCaching: [
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
