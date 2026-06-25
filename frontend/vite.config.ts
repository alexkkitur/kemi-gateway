import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  // Keeps local development proxying intact to prevent local CORS blockers
  const apiTarget = mode === "production" 
    ? "https://kemi-gateway-1.onrender.com" 
    : "http://localhost:8000";

  return {
    server: {
      host: "::",
      port: 8081,
      hmr: { overlay: false },
      allowedHosts: true,
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
          secure: true,
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
  };
});
