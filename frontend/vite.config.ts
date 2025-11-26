/* vite.config.ts */

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  /* Optional: Enforce consistent paths in Linux/WSL */
  server: {
    strictPort: true,
  },
});
