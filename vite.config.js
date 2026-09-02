import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  define: {
    // Lets the app show which build it is running, so a stale tablet
    // cache is obvious instead of being mistaken for a content bug.
    __BUILD_ID__: JSON.stringify(
      new Date().toISOString().slice(0, 16).replace("T", " "),
    ),
  },
  plugins: [react()],
  base: "/mori-reading-pad/",
  server: {
    proxy: {
      "/api": "http://localhost:8787",
    },
  },
});
