import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Set base path for GitHub Pages deployment only when explicitly set
  // Android builds should always use root path for local filesystem
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [],
  resolve: {
    alias: {
    },
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    // Optimize for mobile performance
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Chunk splitting for better loading performance
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'index.html'),
      },
      output: {
        manualChunks: (id) => {
          // Only create Phaser chunk if it's actually imported
          if (id.includes('phaser')) {
            return 'phaser';
          }
          // Vendor chunk for other large dependencies
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
  },
  // Mobile-specific optimizations
  define: {
    __MOBILE__: JSON.stringify(process.env.NODE_ENV === 'production'),
  },
});