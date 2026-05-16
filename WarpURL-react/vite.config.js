import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: baseURL,
        changeOrigin: true,
      },
    },
  },
});
