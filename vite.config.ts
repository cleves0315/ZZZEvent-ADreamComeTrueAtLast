import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: "0.0.0.0", // 允许通过局域网 IP 访问
  },
  resolve: {
    alias: {
      "~": "/src",
    },
  },
})
