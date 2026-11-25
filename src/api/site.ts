import type { Context, Hono } from 'hono';
import { ARTICLES } from '../content/articles.js';
import { AUSTRALIAN_STATES } from '../core/types.js';
import {
  addressFromPath,
  councilPath,
  PAGES_PATH,
  STATE_NAMES,
  statePath,
  suburbPath,
} from '../councils/names.js';
import type { CouncilRegistry } from '../councils/registry.js';
import { findSuburb, suburbsOf } from '../councils/suburbs.js';
import type { CouncilInfo } from '../councils/types.js';
import type { Coverage } from '../service.js';
import {
  addressPage,
  articlePage,
  byState,
  councilPage,
  homePage,
  nearestCouncils,
  statePage,
  suburbPage,
} from './pages.js';
import { escapeHtml, type Page, renderPage, SITE_NAME } from './render.js';
import { SHELL } from './shell.generated.js';

export type { PageData } from './pages.js';

/**
 * The public website around the API: the home page, a page per state, council
 * and suburb, the written pages (guides, about, privacy, contact), and the
 * files search engines and language models look for (`/sitemap.xml`,
 * `/robots.txt`, `/llms.txt`).
 *
 * The UI is a client-rendered app, which crawlers and language models read
 * poorly. So each page is the UI's HTML with real content put into it on the
 * server (`render.ts`): its own title and description, structured data, and
 * plain HTML that says what the page is and links to the pages around it. The
 * pages themselves are built in `pages.ts`, from the council registry and the
 * written content in `src/content/`, so adding a council or an article adds its
 * page, its links and its sitemap entry.
 */
export interface SiteOptions {
  /** The site's canonical origin, e.g. `https://binday.example`. Defaults to the request's own. */
  siteUrl?: string | undefined;
  /** The built UI's HTML. Defaults to the one from this build (`npm run build:web`). */
  shell?: string | undefined;
  /** Where the councils are, for working out each one's neighbours. Without it, pages list none. */
  coverage?: () => Promise<Coverage>;
}

function sitemap(origin: string, councils: CouncilInfo[]): string {
  const paths = [
    '/',
    ...byState(councils).map(([state]) => statePath(state)),
    ...councils.map(councilPath),
    ...ARTICLES.keys(),
    ...councils.flatMap((council) =>
      suburbsOf(council.id).map((suburb) => suburbPath(council, suburb.name)),
    ),
  ];
  const urls = paths.map((path) => `  <url><loc>${escapeHtml(origin + path)}</loc></url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

/** A plain-language guide for language models, in the llms.txt format. */
function llmsTxt(origin: string, councils: CouncilInfo[]): string {
  return `# ${SITE_NAME}

> ${SITE_NAME} tells you which household bins go out, and on which day, for a street address in Australia. It reads each council's own collection calendar. It is free, and it covers ${councils.length} councils so far.

To answer "what bin day is it?" or "which bins go out this week?" for an Australian address, call the API with the address. No key is needed.

## API

- [Bin collection days for an address](${origin}/v1/collections?address=833%20Southport%20Nerang%20Road%2C%20Nerang%20QLD): \`GET /v1/collections?address=<street address>\`. Optional \`date=YYYY-MM-DD\`, or \`from\` and \`to\` for a range (the default is the next two weeks). The response has \`next\` (the next collection day and its bins), \`days\` (each collection day in the range) and \`services\` (each bin and how often it is collected). A bin's \`type\` is one of general, recycling, organics, food, glass, bulky or other. \`confidence\` is "confirmed" when the council stated the date and "projected" when it was worked out from the cycle, which public holidays can shift.
- [Calendar feed for an address](${origin}/v1/calendar.ics?address=833%20Southport%20Nerang%20Road%2C%20Nerang%20QLD): \`GET /v1/calendar.ics?address=<street address>\`. The next year of collection days as an iCalendar feed that calendar apps can subscribe to. Optional \`reminder=18\` adds a reminder at that hour the evening before.
- [Supported councils](${origin}/v1/councils): \`GET /v1/councils\`, optionally \`?state=QLD\`.
- [Map of supported areas](${origin}/v1/coverage): GeoJSON, one feature per council.
- [OpenAPI specification](${origin}/openapi.json) and [interactive documentation](${origin}/docs).

Errors are JSON, \`{"error": {"code", "message"}}\`. \`ADDRESS_NOT_FOUND\` may include \`suggestions\` to retry with. \`COUNCIL_NOT_SUPPORTED\` means the address is real but its council is not covered yet.

## Guides

${[...ARTICLES.values()]
  .filter((article) => article.path.startsWith('/guides/'))
  .map((article) => `- [${article.title}](${origin}${article.path}): ${article.description}`)
  .join('\n')}

## Councils

${byState(councils)
  .map(
    ([state, list]) =>
      `### ${STATE_NAMES[state]}\n\n${list.map((c) => `- [${c.name}](${origin}${councilPath(c)})`).join('\n')}`,
  )
  .join('\n\n')}
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
  const shell = options.shell ?? SHELL;

  const send = (c: Context, page: Page) => {
    // Browsers always revalidate (a new deploy changes the script names); the CDN keeps it an hour.
    c.header('cache-control', 'public, max-age=0, s-maxage=3600');
    return c.html(renderPage(shell, origin(c), page, registry.list().length));
  };
  const text = (c: Context, body: string, type: string) => {
    c.header('cache-control', 'public, max-age=3600, s-maxage=3600');
    return c.body(body, 200, { 'content-type': `${type}; charset=utf-8` });
  };

  app.get('/', (c) => send(c, homePage(registry.list())));

  app.get('/address/*', async (c) => {
    const address = addressFromPath(new URL(c.req.url).pathname);
    return address ? send(c, addressPage(address, registry.list())) : c.redirect('/');
  });

  // The pages' parent has nothing of its own to show; the home page lists every council.
  app.get(PAGES_PATH, (c) => c.redirect('/', 301));
  app.get('/bin-day', (c) => c.redirect('/', 301));
  // Where these pages used to live.
  app.get('/bin-day/*', (c) =>
    c.redirect(new URL(c.req.url).pathname.replace('/bin-day', PAGES_PATH), 301),
  );

  app.get(`${PAGES_PATH}/:state`, (c) => {
    const state = AUSTRALIAN_STATES.find(
      (s) => s.toLowerCase() === c.req.param('state').toLowerCase(),
    );
    const councils = registry.list();
    return state && councils.some((council) => council.state === state)
      ? send(c, statePage(state, councils))
      : c.notFound();
  });

  app.get(`${PAGES_PATH}/:state/:council`, async (c) => {
    const id = `${c.req.param('state')}/${c.req.param('council')}`.toLowerCase();
    const council = registry.list().find((item) => item.id === id);
    if (!council) return c.notFound();
    // The page is worth serving even if the boundary service is down; it just lists no neighbours.
    const coverage = await options.coverage?.().catch(() => undefined);
    return send(c, councilPage(council, coverage ? nearestCouncils(coverage, council) : []));
  });

  app.get(`${PAGES_PATH}/:state/:council/:suburb`, (c) => {
    const id = `${c.req.param('state')}/${c.req.param('council')}`.toLowerCase();
    const council = registry.list().find((item) => item.id === id);
    const suburb = council && findSuburb(council.id, c.req.param('suburb'));
    return council && suburb ? send(c, suburbPage(council, suburb)) : c.notFound();
  });

  for (const article of ARTICLES.values()) {
    app.get(article.path, (c) => send(c, articlePage(article)));
  }

  app.get('/sitemap.xml', (c) => text(c, sitemap(origin(c), registry.list()), 'application/xml'));
  app.get('/robots.txt', (c) =>
    text(c, `User-agent: *\nAllow: /\n\nSitemap: ${origin(c)}/sitemap.xml\n`, 'text/plain'),
  );
  app.get('/llms.txt', (c) => text(c, llmsTxt(origin(c), registry.list()), 'text/markdown'));
}
