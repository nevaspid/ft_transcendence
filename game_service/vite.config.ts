import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  base: '/game/',  // à ajuster selon ton URL d'hébergement
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/main.js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
  server: {
    host: true,
    port: 4002,
    allowedHosts: ['game_service', 'localhost', '127.0.0.1'],
    open: false,
  },
  preview: {
    host: true,
    port: 4002,
    allowedHosts: ['game_service', 'localhost', '127.0.0.1'],
  },
});


