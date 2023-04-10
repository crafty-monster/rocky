import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  base: '/admin',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:48000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
