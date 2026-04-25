import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
    server: {
    port: 5173,
    host: true,

    // proxy: {
    //   '/handler/oauth-callback': {
    //     target: 'https://app.stack-auth.com', // confirm this is the Stack auth endpoint
    //     changeOrigin: true,
    //     secure: false,
    //   },
    // },
  },
   
})
