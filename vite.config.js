import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",
  server: {
    proxy: {
      "/mahadev": {
        target: "https://simplysales.postick.co.in",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/mahadev/, "/mahadev"),
      },
    },
  },
});
