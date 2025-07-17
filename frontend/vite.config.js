// import { defineConfig } from 'vite';

// export default defineConfig({
//   root: './',
//   build: {
//     outDir: 'dist',
//   },
//   server: {
//     open: false,
//     host: true,
//     port: 5173,
//     proxy: {
//       '/api': {
//         target: 'http://user_service:3000',
//         changeOrigin: true,
//         rewrite: (path) => path.replace(/^\/api/, ''),
//       },
//       '/uploads/choices': {
//         target: 'http://localhost:3001',
//         changeOrigin: true,
//       },
//     },
//   },
// });

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
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/game': {
         target: 'http://game_service:4002',  // adresse du jeu en dev (docker)
        changeOrigin: true,
        //rewrite: (path) => path.replace(/^\/game/, ''),
      },
    },
  },
});


