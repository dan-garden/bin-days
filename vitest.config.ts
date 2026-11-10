import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    // Live tests hit real council websites; they only run with `npm run test:live`.
    exclude: process.env.LIVE ? [] : ['test/live/**'],
    testTimeout: process.env.LIVE ? 60_000 : 5_000,
  },
});
