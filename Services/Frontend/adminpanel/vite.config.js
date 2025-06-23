const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');

module.exports = defineConfig(({ command, mode }) => {
  // Get API base URL from environment variables
  const apiBaseUrl = process.env.VITE_API_BASE_URL || 'http://localhost:5261';
  
  return {
    plugins: [react()],
    // Only use proxy in development
    server: command === 'serve' ? {
      proxy: {
        '/api': {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    } : {},
    // Production build configuration
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
          },
        },
      },
    },
    // Base path for deployment
    base: mode === 'production' ? './' : '/',
  };
}); 