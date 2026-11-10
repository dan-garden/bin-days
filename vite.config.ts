import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * The web UI. Source lives in `web/`; the build goes to `public/`, which is
 * committed. Vercel lists a project's static files before it runs any build
 * script, so files generated during its build would never be served.
 */
export default defineConfig({
  root: 'web',
  plugins: [react()],
  build: { outDir: '../public', emptyOutDir: true },
  server: {
    // `npm run dev:web` serves the UI; the API comes from `npm run dev`.
    proxy: Object.fromEntries(
      ['/v1', '/docs', '/openapi.json', '/health'].map((path) => [path, 'http://localhost:3000']),
    ),
  },
});
