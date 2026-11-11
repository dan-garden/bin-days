import { readFileSync, writeFileSync } from 'node:fs';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

/**
 * The web UI. Source lives in `web/`; the build goes to `public/`, which is
 * committed. Vercel lists a project's static files before it runs any build
 * script, so files generated during its build would never be served.
 */
/**
 * Copies the built page into the server's code. The server puts each page's own
 * content into it, and must use the page from its own build: one fetched over
 * the network can come from the previous deploy while a new one is going live,
 * and then names scripts that no longer exist.
 */
const embedShell: Plugin = {
  name: 'embed-shell',
  apply: 'build',
  closeBundle() {
    const html = readFileSync('public/index.html', 'utf8');
    writeFileSync(
      'src/api/shell.generated.ts',
      `// Written by \`npm run build:web\`. Do not edit.\nexport const SHELL = ${JSON.stringify(html)};\n`,
    );
  },
};

export default defineConfig({
  root: 'web',
  plugins: [react(), embedShell],
  build: { outDir: '../public', emptyOutDir: true },
  server: {
    // `npm run dev:web` serves the UI; the API comes from `npm run dev`.
    proxy: Object.fromEntries(
      ['/v1', '/docs', '/openapi.json', '/health'].map((path) => [path, 'http://localhost:3000']),
    ),
  },
});
