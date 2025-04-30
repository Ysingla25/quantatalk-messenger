import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    headers: {
      "Access-Control-Allow-Origin": process.env.VITE_CORS_ORIGIN || "http://localhost:8080",
      "Access-Control-Allow-Methods": process.env.VITE_CORS_METHODS || "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": process.env.VITE_CORS_HEADERS || "Content-Type,Authorization",
    },
    proxy: {
      "/api": {
        target: "https://people.googleapis.com",
        changeOrigin: true,
        secure: false,
        headers: {
          "Access-Control-Allow-Origin": process.env.VITE_CORS_ORIGIN || "http://localhost:8080",
          "Access-Control-Allow-Methods": process.env.VITE_CORS_METHODS || "GET,POST,PUT,DELETE,OPTIONS",
          "Access-Control-Allow-Headers": process.env.VITE_CORS_HEADERS || "Content-Type,Authorization",
        }
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));