import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  build: {
    outDir: 'dist',
  },
  server: {
    open: false,
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://user_service:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/uploads/choices': {
        target: 'http://localhost:3001',  // mettre ici l'URL de ton backend avatar
        changeOrigin: true,
        // Pas de rewrite ici, car tu veux garder le chemin complet
      },
    },
  },
});



