import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"

// https://vitejs.dev/config/
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
      },
    },
  },

  plugins: [vue()],

  server: {
    host: "0.0.0.0",
  },

  resolve: {
    alias: {
      "~": "/src",
    },
  },
})
