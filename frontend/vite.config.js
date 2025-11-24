import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/LavaLust': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/LavaLust/, '/LavaLust')
      },
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true
      },
      '/auth': {
        target: 'http://localhost:3002',
        changeOrigin: true
      },
      '/users': {
        target: 'http://localhost:3002',
        changeOrigin: true
      },
      '/post_section': {
        target: 'http://localhost:3002',
        changeOrigin: true
      },
      '/categories': {
        target: 'http://localhost:3002',
        changeOrigin: true
      },
      '/notifications': {
        target: 'http://localhost:3002',
        changeOrigin: true
      },
      '/uploads': {
    target: 'http://localhost:3002',
    changeOrigin: true
  }
    
    }
  }
})
