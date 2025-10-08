import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [],
  resolve: {
    alias: {
      '@': resolve(process.cwd(), './src'),
      '@/components': resolve(process.cwd(), './src/components'),
      '@/systems': resolve(process.cwd(), './src/systems'),
      '@/scenes': resolve(process.cwd(), './src/scenes'),
      '@/entities': resolve(process.cwd(), './src/entities'),
      '@/utils': resolve(process.cwd(), './src/utils'),
      '@/types': resolve(process.cwd(), './src/types'),
      '@/assets': resolve(process.cwd(), './src/assets'),
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