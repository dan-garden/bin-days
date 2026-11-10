import type { Context, Hono } from 'hono';
import { councilPath, STATE_NAMES, shortCouncilName } from '../councils/names.js';
import type { CouncilRegistry } from '../councils/registry.js';
import type { CouncilInfo } from '../councils/types.js';

/**
 * The public website around the API: the home page, one landing page per
 * council, and the files search engines and language models look for
 * (`/sitemap.xml`, `/robots.txt`, `/llms.txt`).
 *
 * The UI is a client-rendered app, which crawlers and language models read
 * poorly. So each page is the UI's HTML with real content put into it on the
 * server: its own title and description, structured data, and plain HTML that
 * says what the page is. Everything here is generated from the council
 * registry, so adding a council adds its page and its sitemap entry.
 */
export interface SiteOptions {
  /** The site's canonical origin, e.g. `https://binday.example`. Defaults to the request's own. */
  siteUrl?: string | undefined;
  /** Load the built UI's HTML. Defaults to fetching this deployment's `/index.html`. */
  loadShell?: (origin: string) => Promise<string | undefined>;
}

const SITE_NAME = 'Bin Day';
const HEAD = /<!--seo:head-->[\s\S]*?<!--\/seo:head-->/;
const BODY = '<!--seo:body-->';

/** Used if the built UI can't be loaded; the page still reads fine without it. */
const BARE_SHELL = `<!doctype html><html lang="en-AU"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><!--seo:head--><!--/seo:head--></head><body><div id="root">${BODY}</div></body></html>`;

/** What the UI needs to know about the page it was served on. */
export interface PageData {
  council?: Pick<CouncilInfo, 'id' | 'name' | 'state' | 'website'>;
}

const escapeHtml = (text: string) =>
  text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/** JSON that is safe inside a `<script>` element. */
const scriptJson = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');

interface Page {
  path: string;
  title: string;
  description: string;
  /** schema.org descriptions of the page. */
  structuredData: object[];
  data: PageData;
  /** Plain HTML shown until the UI starts, and all that non-JavaScript readers get. */
  body: string;
}

function renderPage(shell: string, origin: string, page: Page): string {
  const url = origin + page.path;
  const meta = (attribute: string, name: string, content: string) =>
    `<meta ${attribute}="${name}" content="${escapeHtml(content)}" />`;
  const head = [
    `<title>${escapeHtml(page.title)}</title>`,
    meta('name', 'description', page.description),
    `<link rel="canonical" href="${escapeHtml(url)}" />`,
    meta('property', 'og:type', 'website'),
    meta('property', 'og:site_name', SITE_NAME),
    meta('property', 'og:title', page.title),
    meta('property', 'og:description', page.description),
    meta('property', 'og:url', url),
    meta('property', 'og:locale', 'en_AU'),
    meta('name', 'twitter:card', 'summary'),
    ...page.structuredData.map(
      (item) => `<script type="application/ld+json">${scriptJson(item)}</script>`,
    ),
    `<script id="page-data" type="application/json">${scriptJson(page.data)}</script>`,
  ].join('\n    ');
  return shell
    .replace(HEAD, () => head)
    .replace(BODY, () => `<div class="seo-fallback">${page.body}</div>`);
}

function application(origin: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_NAME,
    url: `${origin}/`,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    description: 'Shows which bins go out and when, for an Australian street address.',
    areaServed: { '@type': 'Country', name: 'Australia' },
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'AUD' },
  };
}

function byState(councils: CouncilInfo[]): Array<[string, CouncilInfo[]]> {
  const groups = new Map<string, CouncilInfo[]>();
  for (const council of councils) {
    const state = STATE_NAMES[council.state];
    groups.set(state, [...(groups.get(state) ?? []), council]);
  }
  return [...groups].sort((a, b) => b[1].length - a[1].length);
}

function homePage(origin: string, councils: CouncilInfo[]): Page {
  const places = councils.map((c) => shortCouncilName(c.name));
  const sample = ['Brisbane', 'Gold Coast', 'Inner West', 'Ballarat'].filter((p) =>
    places.includes(p),
  );
  const including = sample.length ? `, including ${sample.join(', ')}` : '';
  const description = `Type your address to see your next bin collection day and which bins go out: general waste, recycling or green waste. Free for ${councils.length} Australian councils${including}.`;
  return {
    path: '/',
    title: 'Bin Day: which bins go out this week?',
    description,
    structuredData: [
      { '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, url: `${origin}/` },
      application(origin),
    ],
    data: {},
    body: [
      '<h1>Which bins go out?</h1>',
      `<p>${escapeHtml(description)}</p>`,
      '<h2>Supported councils</h2>',
      ...byState(councils).flatMap(([state, list]) => [
        `<h3>${escapeHtml(state)}</h3>`,
        `<ul>${list
          .map(
            (c) =>
              `<li><a href="${councilPath(c)}">${escapeHtml(shortCouncilName(c.name))} bin day</a></li>`,
          )
          .join('')}</ul>`,
      ]),
      '<p>Developers and AI assistants: see <a href="/llms.txt">llms.txt</a> and the <a href="/docs">API documentation</a>.</p>',
    ].join('\n'),
  };
}

function councilPage(origin: string, council: CouncilInfo): Page {
  const place = shortCouncilName(council.name);
  const state = STATE_NAMES[council.state];
  const description = `Find your next bin day in ${place}, ${state}. Type your address to see when ${council.name} collects, and whether it's general waste, recycling or green waste this week.`;
  const { id, name, website } = council;
  return {
    path: councilPath(council),
    title: `${place} bin day: which bins go out this week?`,
    description,
    structuredData: [
      {
        ...application(origin),
        url: origin + councilPath(council),
        areaServed: { '@type': 'AdministrativeArea', name: `${council.name}, ${state}` },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${origin}/` },
          { '@type': 'ListItem', position: 2, name: `${place} bin day` },
        ],
      },
    ],
    data: { council: { id, name, state: council.state, ...(website ? { website } : {}) } },
    body: [
      `<h1>${escapeHtml(place)} bin day</h1>`,
      `<p>${escapeHtml(description)}</p>`,
      '<h2>How it works</h2>',
      `<ol><li>Type your street address in ${escapeHtml(place)}.</li><li>We look your property up in ${escapeHtml(council.name)}'s own collection calendar.</li><li>You see your next collection day and which bins to put out, plus the weeks after.</li></ol>`,
      website
        ? `<p>The dates come from <a href="${escapeHtml(website)}">${escapeHtml(council.name)}</a>.</p>`
        : '',
      '<p><a href="/">Bin days for other Australian councils</a></p>',
    ].join('\n'),
  };
}

function sitemap(origin: string, councils: CouncilInfo[]): string {
  const urls = ['/', ...councils.map(councilPath)].map(
    (path) => `  <url><loc>${escapeHtml(origin + path)}</loc></url>`,
  );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

/** A plain-language guide for language models, in the llms.txt format. */
function llmsTxt(origin: string, councils: CouncilInfo[]): string {
  return `# ${SITE_NAME}

> ${SITE_NAME} tells you which household bins go out, and on which day, for a street address in Australia. It reads each council's own collection calendar. It is free, and it covers ${councils.length} councils so far.

To answer "what bin day is it?" or "which bins go out this week?" for an Australian address, call the API with the address. No key is needed.

## API

- [Bin collection days for an address](${origin}/v1/collections?address=833%20Southport%20Nerang%20Road%2C%20Nerang%20QLD): \`GET /v1/collections?address=<street address>\`. Optional \`date=YYYY-MM-DD\`, or \`from\` and \`to\` for a range (the default is the next two weeks). The response has \`next\` (the next collection day and its bins), \`days\` (each collection day in the range) and \`services\` (each bin and how often it is collected). A bin's \`type\` is one of general, recycling, organics, food, glass, bulky or other. \`confidence\` is "confirmed" when the council stated the date and "projected" when it was worked out from the cycle, which public holidays can shift.
- [Supported councils](${origin}/v1/councils): \`GET /v1/councils\`, optionally \`?state=QLD\`.
- [Map of supported areas](${origin}/v1/coverage): GeoJSON, one feature per council.
- [OpenAPI specification](${origin}/openapi.json) and [interactive documentation](${origin}/docs).

Errors are JSON, \`{"error": {"code", "message"}}\`. \`ADDRESS_NOT_FOUND\` may include \`suggestions\` to retry with. \`COUNCIL_NOT_SUPPORTED\` means the address is real but its council is not covered yet.

## Councils

${councils.map((c) => `- [${c.name} (${c.state})](${origin}${councilPath(c)})`).join('\n')}
`;
}

export function addSiteRoutes(
  app: Hono,
  registry: CouncilRegistry,
  options: SiteOptions = {},
): void {
  const origin = (c: Context) => {
    if (options.siteUrl) return options.siteUrl.replace(/\/$/, '');
    const { host, hostname } = new URL(c.req.url);
    const local = hostname === 'localhost' || hostname === '127.0.0.1';
    return `${local ? 'http' : 'https'}://${host}`;
  };
  const loadShell =
    options.loadShell ??
    (async (from: string) => {
      const response = await fetch(`${from}/index.html`).catch(() => undefined);
      return response?.ok ? response.text() : undefined;
    });

  const send = async (c: Context, page: Page) => {
    // The UI's HTML comes from the address this request arrived on, which is always this deployment.
    const shell = (await loadShell(new URL(c.req.url).origin)) ?? BARE_SHELL;
    // Browsers always revalidate (a new deploy changes the script names); the CDN keeps it an hour.
    c.header('cache-control', 'public, max-age=0, s-maxage=3600');
    return c.html(renderPage(shell, origin(c), page));
  };
  const text = (c: Context, body: string, type: string) => {
    c.header('cache-control', 'public, max-age=3600, s-maxage=3600');
    return c.body(body, 200, { 'content-type': `${type}; charset=utf-8` });
  };

  app.get('/', (c) => send(c, homePage(origin(c), registry.list())));

  app.get('/bin-day/:state/:council', (c) => {
    const id = `${c.req.param('state')}/${c.req.param('council')}`.toLowerCase();
    const council = registry.list().find((item) => item.id === id);
    return council ? send(c, councilPage(origin(c), council)) : c.notFound();
  });

  app.get('/sitemap.xml', (c) => text(c, sitemap(origin(c), registry.list()), 'application/xml'));
  app.get('/robots.txt', (c) =>
    text(c, `User-agent: *\nAllow: /\n\nSitemap: ${origin(c)}/sitemap.xml\n`, 'text/plain'),
  );
  app.get('/llms.txt', (c) => text(c, llmsTxt(origin(c), registry.list()), 'text/markdown'));
}
