import { viteStaticCopy } from 'vite-plugin-static-copy';

export default {
  root: '.',
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: '../node_modules/typed-json-ts/dist/wasm/typedJson.wasm',
          dest: '.',
          rename: { stripBase: true },
        },
      ],
    }),
  ],
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.scss'],
  },
};
