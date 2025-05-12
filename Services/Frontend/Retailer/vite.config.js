import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react() , tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost:7209',
        changeOrigin: true,
        secure: false, // Use `false` if your backend is using self-signed SSL
      },
    },
  },
})
