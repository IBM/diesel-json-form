import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['./src/**/*.test.(ts|tsx)'],
    snapshotFormat: {
      printShadowRoot: false,
    },
    server: {
      deps: {
        inline: ['@carbon/web-components'],
      },
    },
  },
});
