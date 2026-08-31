import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/mori-reading-pad/",
  server: {
    proxy: {
      "/api": "http://localhost:8787",
    },
  },
});
