import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@repo/panelLabSchema': path.resolve(
        __dirname,
        '../../packages/panel-lab-schema/src/index.mjs'
      )
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/gltf': { target: 'http://127.0.0.1:3001', changeOrigin: true },
      '/api': { target: 'http://127.0.0.1:3001', changeOrigin: true }
    }
  }
});
