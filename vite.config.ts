import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use relative paths for Safari Web Extension compatibility
  base: "./",
  build: {
    rollupOptions: {
      input: {
        panel: resolve(__dirname, "panel.html"),
        devtools: resolve(__dirname, "devtools.html"),
      },
      output: {
        entryFileNames: () => {
          return `assets/[name].js`;
        },
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`,
      },
    },
  },
});
