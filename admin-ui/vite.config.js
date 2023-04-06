import path from 'path';
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

const bootstrap = path.resolve('../node_modules/bootstrap');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  base: '/admin',
  resolve: {
    alias: {
      '~bootstrap': bootstrap,
    }
  },
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