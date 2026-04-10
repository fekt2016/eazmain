import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const devApiTarget = env.VITE_DEV_PROXY_TARGET || 'http://localhost:4000'

  return {
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Same-origin in dev so CSP connect-src 'self' allows Socket.io (ws + polling).
      '/socket.io': { target: devApiTarget, ws: true, changeOrigin: true },
      '/api': { target: devApiTarget, changeOrigin: true },
    },
  },
  build: {
    // SECURITY: Disable source maps in production to prevent code exposure
    sourcemap: false,
    // Minify code for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
    // Rollup options for better security
    rollupOptions: {
      output: {
        // Obfuscate chunk names in production
        chunkFileNames: 'assets/[hash].js',
        entryFileNames: 'assets/[hash].js',
        assetFileNames: 'assets/[hash].[ext]',
        manualChunks: {
          // Core React — always needed
          'vendor-react': [
            'react',
            'react-dom',
            'react-router-dom',
          ],
          // Data fetching
          'vendor-query': [
            '@tanstack/react-query',
            'axios',
          ],
          // Styling
          'vendor-styled': [
            'styled-components',
          ],
          // Animation — heavy, rarely needed at load
          'vendor-motion': [
            'framer-motion',
          ],
          // Icons — large, loaded everywhere but 
          // separating allows better caching
          'vendor-icons': [
            'react-icons',
          ],
          // Carousels — only needed on specific pages
          'vendor-carousel': [
            'swiper',
            'react-slick',
          ],
        },
      },
    },
  },
  }
})
