import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 8080, // Explicitly set frontend to 8080 since that's where you are
    proxy: {
      '/api': {
        target: 'https://localhost:5001', // <--- CHANGED TO HTTPS & 5001
        changeOrigin: true,
        secure: false, // <--- REQUIRED for .NET local HTTPS
      }
    }
  }
})