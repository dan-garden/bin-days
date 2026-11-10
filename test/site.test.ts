import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';
import { addSiteRoutes, type SiteOptions } from '../src/api/site.js';
import { CouncilRegistry } from '../src/councils/registry.js';
import type { CouncilAdapter } from '../src/councils/types.js';

const council = (
  id: string,
  name: string,
  extra: Partial<CouncilAdapter> = {},
): CouncilAdapter => ({
  id,
  name,
  state: 'QLD',
  lgaCodes: [id],
  timezone: 'Australia/Brisbane',
  getSchedule: async () => ({ matchedAddress: '', services: [] }),
  ...extra,
});

const SHELL =
  '<html><head><!--seo:head--><title>Default</title><!--/seo:head--></head><body><div id="root"><!--seo:body--></div><script src="/assets/app.js"></script></body></html>';

function site(options: SiteOptions = {}) {
  const app = new Hono();
  const registry = new CouncilRegistry([
    council('qld/brisbane', 'Brisbane City Council', {
      website: 'https://example.org/bins?a=1&b=2',
    }),
    council('vic/ballarat', 'City of Ballarat', { state: 'VIC' }),
  ]);
  addSiteRoutes(app, registry, { loadShell: async () => SHELL, ...options });
  return app;
}

const get = async (path: string, options?: SiteOptions) => {
  const response = await site(options).request(`https://binday.test${path}`);
  return { response, body: await response.text() };
};

describe('website pages', () => {
  it('serves the home page as the UI with crawlable content in it', async () => {
    const { response, body } = await get('/');
    expect(response.headers.get('cache-control')).toContain('s-maxage');
    expect(body).toContain('<title>Bin Day: which bins go out this week?</title>');
    expect(body).not.toContain('<title>Default</title>');
    expect(body).toContain('<link rel="canonical" href="https://binday.test/" />');
    expect(body).toContain('Free for 2 Australian councils, including Brisbane, Ballarat.');
    expect(body).toContain('<a href="/bin-day/qld/brisbane">Brisbane bin day</a>');
    expect(body).toContain('<a href="/bin-day/vic/ballarat">Ballarat bin day</a>');
    expect(body).toContain('<script src="/assets/app.js"></script>'); // the UI still loads
  });

  it('gives each council its own page, title and data for the UI', async () => {
    const { body } = await get('/bin-day/QLD/brisbane');
    expect(body).toContain('<title>Brisbane bin day: which bins go out this week?</title>');
    expect(body).toContain(
      '<link rel="canonical" href="https://binday.test/bin-day/qld/brisbane" />',
    );
    expect(body).toContain('<h1>Brisbane bin day</h1>');
    expect(body).toContain('href="https://example.org/bins?a=1&amp;b=2"'); // escaped
    const data = /<script id="page-data"[^>]*>(.*?)<\/script>/.exec(body)?.[1];
    expect(JSON.parse(data ?? '')).toEqual({
      council: {
        id: 'qld/brisbane',
        name: 'Brisbane City Council',
        state: 'QLD',
        website: 'https://example.org/bins?a=1&b=2',
      },
    });
    for (const block of body.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)) {
      expect(JSON.parse(block[1] ?? '')['@context']).toBe('https://schema.org');
    }
  });

  it('returns 404 for a council that is not supported', async () => {
    expect((await get('/bin-day/qld/atlantis')).response.status).toBe(404);
  });

  it('still serves a readable page when the UI cannot be loaded', async () => {
    const { response, body } = await get('/', { loadShell: async () => undefined });
    expect(response.status).toBe(200);
    expect(body).toContain('<h1>Which bins go out?</h1>');
  });

  it('uses the configured site address for canonical links', async () => {
    const { body } = await get('/', { siteUrl: 'https://binday.example/' });
    expect(body).toContain('<link rel="canonical" href="https://binday.example/" />');
  });
});

describe('files for crawlers and language models', () => {
  it('lists every page in the sitemap and points robots at it', async () => {
    const sitemap = await get('/sitemap.xml');
    expect(sitemap.response.headers.get('content-type')).toContain('application/xml');
    expect([...sitemap.body.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1])).toEqual([
      'https://binday.test/',
      'https://binday.test/bin-day/qld/brisbane',
      'https://binday.test/bin-day/vic/ballarat',
    ]);
    expect((await get('/robots.txt')).body).toContain('Sitemap: https://binday.test/sitemap.xml');
  });

  it('explains the API to language models in llms.txt', async () => {
    const { body } = await get('/llms.txt');
    expect(body).toMatch(/^# Bin Day\n\n> /);
    expect(body).toContain('https://binday.test/v1/collections?address=');
    expect(body).toContain('- [City of Ballarat (VIC)](https://binday.test/bin-day/vic/ballarat)');
  });
});
