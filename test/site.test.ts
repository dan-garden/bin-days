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
    expect(body).toContain('<title>Bin Days: which bins go out this week?</title>');
    expect(body).not.toContain('<title>Default</title>');
    expect(body).toContain('<link rel="canonical" href="https://binday.test/" />');
    expect(body).toContain('Free for 2 Australian councils, including Brisbane.');
    expect(body).toContain('<a href="/bin-days/qld">Queensland bin days</a>');
    expect(body).toContain('<a href="/bin-days/qld/brisbane">Brisbane bin day</a>');
    expect(body).toContain('<a href="/bin-days/vic/ballarat">Ballarat bin day</a>');
    expect(body).toContain('<script src="/assets/app.js"></script>'); // the UI still loads
  });

  it('gives each council its own page, title and data for the UI', async () => {
    const { body } = await get('/bin-days/QLD/brisbane');
    expect(body).toContain('<title>Brisbane bin day: which bins go out this week?</title>');
    expect(body).toContain(
      '<link rel="canonical" href="https://binday.test/bin-days/qld/brisbane" />',
    );
    expect(body).toContain('<h1 class="hero-title">Brisbane bin day</h1>');
    expect(body).toContain('href="https://example.org/bins?a=1&amp;b=2"'); // escaped
    const data = /<script id="page-data"[^>]*>(.*?)<\/script>/.exec(body)?.[1];
    expect(JSON.parse(data ?? '')).toEqual({
      council: {
        id: 'qld/brisbane',
        name: 'Brisbane City Council',
        state: 'QLD',
        website: 'https://example.org/bins?a=1&b=2',
      },
      nearby: [],
      councilCount: 2,
    });
    for (const block of body.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)) {
      expect(JSON.parse(block[1] ?? '')['@context']).toBe('https://schema.org');
    }
  });

  it('gives each state a page listing its councils', async () => {
    const { body } = await get('/bin-days/VIC');
    expect(body).toContain("<title>Victoria bin days: find your council's collection day</title>");
    expect(body).toContain('<link rel="canonical" href="https://binday.test/bin-days/vic" />');
    expect(body).toContain('<a href="/bin-days/vic/ballarat">Ballarat bin day</a>');
    expect(body).not.toContain('/bin-days/qld/brisbane');
    expect(body).toContain('"state":"VIC"');
    expect((await get('/bin-days/wa')).response.status).toBe(404); // no councils there
    expect((await get('/bin-days/zz')).response.status).toBe(404);
  });

  it('links a council to its state and its nearest neighbours', async () => {
    const square = (x: number, y: number) => ({
      type: 'Polygon',
      coordinates: [
        [
          [x, y],
          [x + 0.1, y],
          [x + 0.1, y + 0.1],
          [x, y],
        ],
      ],
    });
    const feature = (council: string, name: string, x: number, y: number) => ({
      type: 'Feature' as const,
      properties: { council, name, state: 'QLD' as const },
      geometry: square(x, y),
    });
    const coverage = async () => ({
      type: 'FeatureCollection' as const,
      features: [
        feature('qld/brisbane', 'Brisbane City Council', 153.0, -27.5),
        feature('qld/far', 'Far Away Shire Council', 145.0, -17.0),
        feature('qld/near', 'Near City Council', 153.2, -27.7),
      ],
    });
    const { body } = await get('/bin-days/qld/brisbane', { coverage });
    expect(body).toContain(
      '<nav class="shell-trail"><a href="/">Bin Days</a> › <a href="/bin-days/qld">Queensland</a> › Brisbane bin day</nav>',
    );
    const near = body.indexOf('/bin-days/qld/near');
    expect(near).toBeGreaterThan(-1);
    expect(near).toBeLessThan(body.indexOf('/bin-days/qld/far')); // nearest first
    expect(body).toContain('"@type":"BreadcrumbList"');

    // The page still works when the boundary service is down.
    const down = await get('/bin-days/qld/brisbane', {
      coverage: () => Promise.reject(new Error('down')),
    });
    expect(down.response.status).toBe(200);
    expect(down.body).not.toContain('Councils near');
  });

  it('returns 404 for a council that is not supported', async () => {
    expect((await get('/bin-days/qld/atlantis')).response.status).toBe(404);
  });

  it('still serves a readable page when the UI cannot be loaded', async () => {
    const { response, body } = await get('/', { loadShell: async () => undefined });
    expect(response.status).toBe(200);
    expect(body).toContain('<h1 class="hero-title">Which bins go out?</h1>');
  });

  it('opens a shared address link on that address, and keeps it out of search results', async () => {
    const { body } = await get('/address/2/15+Example+Street,+Nerang+QLD');
    expect(body).toContain('<title>Bin days for 2/15 Example Street, Nerang QLD</title>');
    expect(body).toContain('"address":"2/15 Example Street, Nerang QLD"');
    expect(body).toContain('<meta name="robots" content="noindex" />');
    expect(body).not.toContain('rel="canonical"');
    expect((await get('/sitemap.xml')).body).not.toContain('/address/');
  });

  it('sends the old page addresses, and the bare parent, somewhere real', async () => {
    const old = await get('/bin-day/qld/brisbane');
    expect(old.response.status).toBe(301);
    expect(old.response.headers.get('location')).toBe('/bin-days/qld/brisbane');
    for (const path of ['/bin-days', '/bin-day']) {
      expect((await get(path)).response.headers.get('location')).toBe('/');
    }
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
      'https://binday.test/bin-days/qld',
      'https://binday.test/bin-days/vic',
      'https://binday.test/bin-days/qld/brisbane',
      'https://binday.test/bin-days/vic/ballarat',
    ]);
    expect((await get('/robots.txt')).body).toContain('Sitemap: https://binday.test/sitemap.xml');
  });

  it('explains the API to language models in llms.txt', async () => {
    const { body } = await get('/llms.txt');
    expect(body).toMatch(/^# Bin Days\n\n> /);
    expect(body).toContain('https://binday.test/v1/collections?address=');
    expect(body).toContain('- [City of Ballarat](https://binday.test/bin-days/vic/ballarat)');
  });
});
