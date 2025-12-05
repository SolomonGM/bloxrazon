import { defineConfig } from 'vite';
import solidStyled from 'vite-plugin-solid-styled';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [
    solidPlugin(),
    solidStyled({
      prefix: 'my-prefix', // optional
      filter: {
        include: 'src/**/*.{js,tsx,jsx}',
        exclude: 'node_modules/**/*.{js,tsx,jsx}',
      },
    }),
  ],
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true,
      },
      '/slots': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/user': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        entryFileNames: '[name].[hash].js',
        chunkFileNames: '[name].[hash].js',
        assetFileNames: '[name].[hash].[ext]'
      }
    }
  },
});