const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');

module.exports = defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost:7209',
        changeOrigin: true,
        secure: false, // Use `false` if your backend is using self-signed SSL
      },
    },
  },
  
}); 