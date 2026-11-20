import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  publicDir: false,
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    outDir: 'public/js/worker',
    emptyOutDir: false,
    sourcemap: false,
    minify: true,
    lib: {
      entry: path.resolve(import.meta.dirname, 'src-worker/SandboxWorker.ts'),
      formats: ['iife'],
      name: 'JsonFormSchemaWorker',
      fileName: () => 'JsonFormSchemaWorker.bundle.js',
    },
  },
});
