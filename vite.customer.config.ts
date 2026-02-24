/**
 * Vite config voor Customer App
 * 
 * Aparte configuratie voor customer-facing app.
 * Gebruik: vite --config vite.customer.config.ts
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  root: 'src/customer-app',
  publicDir: path.resolve(__dirname, 'src/customer-app/public'),
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
  build: {
    outDir: '../../dist-customer',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5174, // Andere poort dan sales app (5173)
  },
});
