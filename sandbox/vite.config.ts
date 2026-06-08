import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    commonjsOptions: {
      include: [/node_modules/, /json-form/],
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@diesel-parser/json-form': path.resolve(
        __dirname,
        '../json-form/src/index.tsx',
      ),
    },
  },
  optimizeDeps: {
    include: ['@diesel-parser/json-form'],
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Add any SCSS options if needed
      },
    },
  },
});

// Made with Bob
