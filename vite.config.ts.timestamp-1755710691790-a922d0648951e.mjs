// vite.config.ts
import { defineConfig } from "file:///D:/Projects/quantatalk-messenger/node_modules/vite/dist/node/index.js";
import react from "file:///D:/Projects/quantatalk-messenger/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
import { componentTagger } from "file:///D:/Projects/quantatalk-messenger/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "D:\\Projects\\quantatalk-messenger";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    headers: {
      "Access-Control-Allow-Origin": process.env.VITE_CORS_ORIGIN || "http://localhost:8080",
      "Access-Control-Allow-Methods": process.env.VITE_CORS_METHODS || "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": process.env.VITE_CORS_HEADERS || "Content-Type,Authorization"
    },
    proxy: {
      "/api": {
        target: "https://people.googleapis.com",
        changeOrigin: true,
        secure: false,
        headers: {
          "Access-Control-Allow-Origin": process.env.VITE_CORS_ORIGIN || "http://localhost:8080",
          "Access-Control-Allow-Methods": process.env.VITE_CORS_METHODS || "GET,POST,PUT,DELETE,OPTIONS",
          "Access-Control-Allow-Headers": process.env.VITE_CORS_HEADERS || "Content-Type,Authorization"
        }
      }
    }
  },
  plugins: [
    react(),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxQcm9qZWN0c1xcXFxxdWFudGF0YWxrLW1lc3NlbmdlclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcUHJvamVjdHNcXFxccXVhbnRhdGFsay1tZXNzZW5nZXJcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L1Byb2plY3RzL3F1YW50YXRhbGstbWVzc2VuZ2VyL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xyXG4gIHNlcnZlcjoge1xyXG4gICAgaG9zdDogXCI6OlwiLFxyXG4gICAgcG9ydDogODA4MCxcclxuICAgIGhlYWRlcnM6IHtcclxuICAgICAgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIjogcHJvY2Vzcy5lbnYuVklURV9DT1JTX09SSUdJTiB8fCBcImh0dHA6Ly9sb2NhbGhvc3Q6ODA4MFwiLFxyXG4gICAgICBcIkFjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHNcIjogcHJvY2Vzcy5lbnYuVklURV9DT1JTX01FVEhPRFMgfHwgXCJHRVQsUE9TVCxQVVQsREVMRVRFLE9QVElPTlNcIixcclxuICAgICAgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzXCI6IHByb2Nlc3MuZW52LlZJVEVfQ09SU19IRUFERVJTIHx8IFwiQ29udGVudC1UeXBlLEF1dGhvcml6YXRpb25cIixcclxuICAgIH0sXHJcbiAgICBwcm94eToge1xyXG4gICAgICBcIi9hcGlcIjoge1xyXG4gICAgICAgIHRhcmdldDogXCJodHRwczovL3Blb3BsZS5nb29nbGVhcGlzLmNvbVwiLFxyXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICBzZWN1cmU6IGZhbHNlLFxyXG4gICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgIFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCI6IHByb2Nlc3MuZW52LlZJVEVfQ09SU19PUklHSU4gfHwgXCJodHRwOi8vbG9jYWxob3N0OjgwODBcIixcclxuICAgICAgICAgIFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kc1wiOiBwcm9jZXNzLmVudi5WSVRFX0NPUlNfTUVUSE9EUyB8fCBcIkdFVCxQT1NULFBVVCxERUxFVEUsT1BUSU9OU1wiLFxyXG4gICAgICAgICAgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzXCI6IHByb2Nlc3MuZW52LlZJVEVfQ09SU19IRUFERVJTIHx8IFwiQ29udGVudC1UeXBlLEF1dGhvcml6YXRpb25cIixcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG4gIHBsdWdpbnM6IFtcclxuICAgIHJlYWN0KCksXHJcbiAgICBtb2RlID09PSAnZGV2ZWxvcG1lbnQnICYmIGNvbXBvbmVudFRhZ2dlcigpLFxyXG4gIF0uZmlsdGVyKEJvb2xlYW4pLFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxyXG4gICAgfSxcclxuICB9LFxyXG59KSk7Il0sCiAgIm1hcHBpbmdzIjogIjtBQUF3UixTQUFTLG9CQUFvQjtBQUNyVCxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsdUJBQXVCO0FBSGhDLElBQU0sbUNBQW1DO0FBS3pDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxPQUFPO0FBQUEsRUFDekMsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLE1BQ1AsK0JBQStCLFFBQVEsSUFBSSxvQkFBb0I7QUFBQSxNQUMvRCxnQ0FBZ0MsUUFBUSxJQUFJLHFCQUFxQjtBQUFBLE1BQ2pFLGdDQUFnQyxRQUFRLElBQUkscUJBQXFCO0FBQUEsSUFDbkU7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxRQUNOLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLFFBQVE7QUFBQSxRQUNSLFNBQVM7QUFBQSxVQUNQLCtCQUErQixRQUFRLElBQUksb0JBQW9CO0FBQUEsVUFDL0QsZ0NBQWdDLFFBQVEsSUFBSSxxQkFBcUI7QUFBQSxVQUNqRSxnQ0FBZ0MsUUFBUSxJQUFJLHFCQUFxQjtBQUFBLFFBQ25FO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixTQUFTLGlCQUFpQixnQkFBZ0I7QUFBQSxFQUM1QyxFQUFFLE9BQU8sT0FBTztBQUFBLEVBQ2hCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFDRixFQUFFOyIsCiAgIm5hbWVzIjogW10KfQo=
