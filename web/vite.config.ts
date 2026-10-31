import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import postcssPxtorem from 'postcss-pxtorem';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  base: '/nihao-deutsch/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@nihao-deutsch/shared': path.resolve(__dirname, '../shared/src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          vendor: ['axios', 'zustand', 'jsqr'],
        },
      },
    },
  },
  css: {
    postcss: {
      plugins: [
        postcssPxtorem({
          rootValue: 37.5,
          unitPrecision: 5,
          propList: ['*'],
          selectorBlackList: [/^body$/],
          replace: true,
          mediaQuery: false,
          minPixelValue: 0,
        }),
        autoprefixer(),
      ],
    },
  },
});
