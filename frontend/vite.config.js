import { defineConfig } from 'vite';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export default defineConfig({
  root: './',
  server: {
    host: process.env.SERVER_HOST || '0.0.0.0',
    port: 5173,
    allowedHosts: ['pongwars.com', 'localhost', '127.0.0.1'],
    proxy: {
      '/api': {
        target: `http://user_service:3000`,
        changeOrigin: true,
        secure: false,
      },
      '/auth/google/': {
        target: `http://google_auth_service:4003`,
        changeOrigin: true,
        secure: false,
      },
      '/user': {
        target: `http://user_service:3000`,
        changeOrigin: true,
        secure: false,
      },
      '/avatar': {
        target: `http://avatar_service:3001`,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/avatar/, ''),
      },
      '/uploads': {
        target: `http://avatar_service:3001`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/uploads/, ''),
      },
      '/twofa': {
        target: `http://twofa_service:4001`,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/twofa/, ''),
      },
      '/game': {
        target: `http://game_service:4002`,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/game/, ''),
      },
    },
  },
  define: {
    'process.env': process.env,
  },
});

