import type { Hono } from 'hono';
import { createApp } from './api/app.js';
import { addSiteRoutes } from './api/site.js';
import { createServiceFromEnv } from './config.js';

try {
  process.loadEnvFile();
} catch {
  // No .env file, which is fine in production.
}

/**
 * The app, configured from the environment. Vercel deploys this file as-is:
 * it picks `src/app.ts` by name, requires the literal `hono` import above and
 * serves the default export. `server.ts` wraps the same app for plain Node.
 */
const service = createServiceFromEnv();
const app: Hono = createApp(service);

// Vercel's CDN serves `public/` by exact path only, so `/` and the council
// pages reach the app, which serves the UI with each page's content in it.
addSiteRoutes(app, service.registry, {
  siteUrl: process.env.SITE_URL,
  coverage: () => service.coverage(),
});

export default app;
