import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: { overlay: false },
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  build: {
    target: "esnext",
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("react") || id.includes("react-dom") || id.includes("react-router-dom")) {
            return "vendor";
          }
          if (id.includes("@radix-ui")) {
            return "ui";
          }
          if (id.includes("@tanstack")) {
            return "query";
          }
          if (id.includes("recharts")) {
            return "charts";
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
}));
