import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { normaliseState } from '../core/address.js';
import { secondsUntilMidnight } from '../core/date.js';
import { BinDaysError, type BinDaysErrorCode } from '../core/errors.js';
import type { BinDaysService } from '../service.js';
import { CollectionsQuery, DOCS_HTML, openApiDocument } from './openapi.js';

const STATUS: Record<BinDaysErrorCode, ContentfulStatusCode> = {
  INVALID_INPUT: 400,
  ADDRESS_NOT_FOUND: 404,
  COUNCIL_NOT_SUPPORTED: 422,
  UPSTREAM_ERROR: 502,
  PARSE_ERROR: 502,
};

export function createApp(service: BinDaysService): Hono {
  const app = new Hono();

  app.use('/v1/*', cors());
  // API responses are for programs to fetch, not for search results.
  app.use('/v1/*', async (c, next) => {
    await next();
    c.header('x-robots-tag', 'noindex');
  });

  app.get('/health', async (c) => c.json({ ok: true, cache: await service.cacheStatus() }));

  app.get('/openapi.json', cors(), (c) => c.json(openApiDocument()));
  app.get('/docs', (c) => c.html(DOCS_HTML));

  /**
   * GET /v1/collections?address=833 Southport Nerang Rd Nerang&from=2026-11-10&to=2026-11-30
   * GET /v1/collections?address=...&date=2026-11-13
   */
  app.get('/v1/collections', async (c) => {
    const parsed = CollectionsQuery.safeParse(c.req.query());
    if (!parsed.success) {
      throw new BinDaysError('INVALID_INPUT', parsed.error.issues.map((i) => i.message).join('; '));
    }
    const { address, date, from, to, council } = parsed.data;
    const result = await service.lookup({
      address,
      ...(date ? { date } : {}),
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
      ...(council ? { council } : {}),
    });
    // The answer only changes when the day does, so a CDN in front (e.g. Vercel's) keeps it
    // until the council's midnight. Browsers check back sooner.
    const seconds = secondsUntilMidnight(result.timezone);
    c.header('cache-control', `public, max-age=${Math.min(seconds, 1800)}, s-maxage=${seconds}`);
    return c.json(result);
  });

  /** GET /v1/councils?state=QLD lists supported councils. */
  app.get('/v1/councils', (c) => {
    const state = normaliseState(c.req.query('state'));
    return c.json({ councils: service.registry.list(state ? { state } : {}) });
  });

  /** GET /v1/coverage is a GeoJSON map of the areas the supported councils cover. */
  app.get('/v1/coverage', async (c) => {
    const coverage = await service.coverage();
    // A CDN can keep this for a day (a deploy clears it). Browsers check hourly, so a newly
    // added council shows up on the map without waiting a day.
    c.header('cache-control', 'public, max-age=3600, s-maxage=86400');
    return c.json(coverage);
  });

  app.onError((error, c) => {
    if (error instanceof BinDaysError) {
      return c.json(
        { error: { code: error.code, message: error.message, ...(error.details ?? {}) } },
        STATUS[error.code],
      );
    }
    console.error(error);
    return c.json({ error: { code: 'INTERNAL', message: 'Something went wrong' } }, 500);
  });

  return app;
}
