import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { compress } from 'hono/compress';
import app from './app.js';

// Hosts like Vercel compress and serve these themselves; plain Node needs to do it here.
app.use('/*', compress());
app.use('/*', serveStatic({ root: './public' }));

const port = Number(process.env.PORT) || 3000;
serve({ fetch: app.fetch, port }, ({ port }) => {
  console.log(`bin-days listening on http://localhost:${port}`);
});
