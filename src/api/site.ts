import type { Context, Hono } from 'hono';
import { AUSTRALIAN_STATES, type AustralianState } from '../core/types.js';
import {
  addressFromPath,
  addressPath,
  councilPath,
  PAGES_PATH,
  pageHeading,
  STATE_NAMES,
  shortCouncilName,
  sourceDescription,
  statePath,
} from '../councils/names.js';
import type { CouncilRegistry } from '../councils/registry.js';
import type { CouncilInfo } from '../councils/types.js';
import { boundsOf, centreOf, distanceKm } from '../geo/bounds.js';
import type { Coverage } from '../service.js';
import { SHELL } from './shell.generated.js';

/**
 * The public website around the API: the home page, a page per state, a page
 * per council, and the files search engines and language models look for
 * (`/sitemap.xml`, `/robots.txt`, `/llms.txt`).
 *
 * The UI is a client-rendered app, which crawlers and language models read
 * poorly. So each page is the UI's HTML with real content put into it on the
 * server: its own title and description, structured data, and plain HTML that
 * says what the page is and links to the pages around it. Everything here is
 * generated from the council registry, so adding a council adds its page, its
 * links and its sitemap entry.
 */
export interface SiteOptions {
  /** The site's canonical origin, e.g. `https://binday.example`. Defaults to the request's own. */
  siteUrl?: string | undefined;
  /** The built UI's HTML. Defaults to the one from this build (`npm run build:web`). */
  shell?: string | undefined;
  /** Where the councils are, for working out each one's neighbours. Without it, pages list none. */
  coverage?: () => Promise<Coverage>;
}

const SITE_NAME = 'Bin Days';
const HEAD = /<!--seo:head-->[\s\S]*?<!--\/seo:head-->/;
const BODY = '<!--seo:body-->';
/** How many neighbouring councils a council's page links to. */
const NEARBY = 6;

type CouncilLink = Pick<CouncilInfo, 'id' | 'name' | 'state'>;

/** What the UI needs to know about the page it was served on. */
export interface PageData {
  /** Set on a state's page. */
  state?: AustralianState;
  /** Set on a shared link to one address, which the UI looks up straight away. */
  address?: string;
  /** Set on a council's page. */
  council?: Pick<CouncilInfo, 'id' | 'name' | 'state' | 'website' | 'platform'>;
  /** The closest other councils, nearest first. */
  nearby?: CouncilLink[];
  /** Every supported council, on the pages that list them, so the UI needn't fetch them. */
  councils?: CouncilLink[];
  /** How many councils are supported. The UI asks for the coverage map by this number, so a
   * browser's saved copy is not reused once a council has been added. */
  councilCount?: number;
}

const escapeHtml = (text: string) =>
  text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/** JSON that is safe inside a `<script>` element. */
const scriptJson = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');

const link = (href: string, text: string) =>
  `<a href="${escapeHtml(href)}">${escapeHtml(text)}</a>`;
const asLink = ({ id, name, state }: CouncilLink): CouncilLink => ({ id, name, state });
const councilLinks = (councils: CouncilLink[]) =>
  `<ul>${councils.map((c) => `<li>${link(councilPath(c), `${shortCouncilName(c.name)} bin day`)}</li>`).join('')}</ul>`;

interface Page {
  path: string;
  title: string;
  description: string;
  /** The trail from the home page down to this page, for the breadcrumb. */
  trail: Array<{ name: string; path: string }>;
  data: PageData;
  /** Keep the page out of search results. */
  private?: boolean;
  /** Plain HTML shown until the UI starts, and all that non-JavaScript readers get. */
  body: string[];
}

function renderPage(shell: string, origin: string, page: Page, councilCount: number): string {
  const url = origin + page.path;
  const meta = (attribute: string, name: string, content: string) =>
    `<meta ${attribute}="${name}" content="${escapeHtml(content)}" />`;
  const structuredData: object[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: SITE_NAME,
      url,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      description: page.description,
      areaServed: page.data.council
        ? {
            '@type': 'AdministrativeArea',
            name: `${page.data.council.name}, ${STATE_NAMES[page.data.council.state]}`,
          }
        : { '@type': 'Country', name: 'Australia' },
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'AUD' },
    },
  ];
  if (page.trail.length > 1) {
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: page.trail.map((step, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: step.name,
        item: origin + step.path,
      })),
    });
  } else {
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: `${origin}/`,
    });
  }
  const head = [
    `<title>${escapeHtml(page.title)}</title>`,
    meta('name', 'description', page.description),
    page.private
      ? meta('name', 'robots', 'noindex')
      : `<link rel="canonical" href="${escapeHtml(url)}" />`,
    meta('property', 'og:type', 'website'),
    meta('property', 'og:site_name', SITE_NAME),
    meta('property', 'og:title', page.title),
    meta('property', 'og:description', page.description),
    meta('property', 'og:url', url),
    meta('property', 'og:locale', 'en_AU'),
    meta('property', 'og:image', `${origin}/og-image.png`),
    meta('property', 'og:image:width', '1200'),
    meta('property', 'og:image:height', '630'),
    meta('property', 'og:image:alt', `${SITE_NAME}: which bins go out this week?`),
    meta('name', 'twitter:card', 'summary_large_image'),
    ...structuredData.map(
      (item) => `<script type="application/ld+json">${scriptJson(item)}</script>`,
    ),
    `<script id="page-data" type="application/json">${scriptJson({ ...page.data, councilCount })}</script>`,
  ].join('\n    ');
  const trail =
    page.trail.length > 1
      ? `<nav class="shell-trail">${page.trail
          .map((step, index) =>
            index < page.trail.length - 1 ? link(step.path, step.name) : escapeHtml(step.name),
          )
          .join(' › ')}</nav>`
      : '';
  // The top of the page, laid out with the UI's own styles, so the first paint already looks
  // like the finished page and the UI takes over without a jump. The rest (`seo-more`) is for
  // readers without JavaScript; the UI shows the same content its own way.
  const { title, lede } = pageHeading(page.data);
  const shellHtml = `<div class="shell">
<div class="shell-topbar">${link('/', SITE_NAME)}</div>
${trail}
<div class="hero${page.trail.length > 1 ? ' hero-compact' : ''}">
<div class="shell-bins"></div>
<h1 class="hero-title">${escapeHtml(title)}</h1>
<p class="hero-lede">${escapeHtml(lede)}</p>
</div>
</div>
<div class="seo-more">${page.body.join('\n')}</div>`;
  return shell.replace(HEAD, () => head).replace(BODY, () => shellHtml);
}

const HOME = { name: SITE_NAME, path: '/' };

/** States that have at least one council, biggest first, each with its councils. */
function byState(councils: CouncilInfo[]): Array<[AustralianState, CouncilInfo[]]> {
  return AUSTRALIAN_STATES.map((state): [AustralianState, CouncilInfo[]] => [
    state,
    councils.filter((c) => c.state === state),
  ])
    .filter(([, list]) => list.length > 0)
    .sort((a, b) => b[1].length - a[1].length);
}

function homePage(councils: CouncilInfo[]): Page {
  const places = councils.map((c) => shortCouncilName(c.name));
  const sample = ['Brisbane', 'Adelaide', 'Canberra', 'Gold Coast', 'Hobart'].filter((p) =>
    places.includes(p),
  );
  const including = sample.length ? `, including ${sample.join(', ')}` : '';
  const description = `Type your address to see your next bin collection day and which bins go out: general waste, recycling or green waste. Free for ${councils.length} Australian councils${including}.`;
  return {
    path: '/',
    title: `${SITE_NAME}: which bins go out this week?`,
    description,
    trail: [HOME],
    data: { councils: councils.map(asLink) },
    body: [
      `<p>${escapeHtml(description)}</p>`,
      '<h2>Supported councils</h2>',
      ...byState(councils).flatMap(([state, list]) => [
        `<h3>${link(statePath(state), `${STATE_NAMES[state]} bin days`)}</h3>`,
        councilLinks(list),
      ]),
      '<p>Developers and AI assistants: see <a href="/llms.txt">llms.txt</a> and the <a href="/docs">API documentation</a>.</p>',
    ],
  };
}

/** A shared link to one address: the home page, opened on that address's bins. */
function addressPage(address: string, councils: CouncilInfo[]): Page {
  const home = homePage(councils);
  return {
    ...home,
    path: addressPath(address),
    title: `Bin days for ${address}`,
    description: `Which bins go out, and when, at ${address}.`,
    data: { ...home.data, address },
    private: true,
  };
}

function statePage(state: AustralianState, councils: CouncilInfo[]): Page {
  const name = STATE_NAMES[state];
  const inState = councils.filter((c) => c.state === state);
  const description = `Find your bin collection day in ${name}. Pick your council or type your address to see which bins go out this week, for ${inState.length} ${name} council${inState.length === 1 ? '' : 's'}.`;
  return {
    path: statePath(state),
    title: `${name} bin days: find your council's collection day`,
    description,
    trail: [HOME, { name, path: statePath(state) }],
    data: { state, councils: councils.map(asLink) },
    body: [
      `<p>${escapeHtml(description)}</p>`,
      `<h2>Councils in ${escapeHtml(name)}</h2>`,
      councilLinks(inState),
      `<p>${link('/', 'Bin days in other states')}</p>`,
    ],
  };
}

function councilPage(council: CouncilInfo, nearby: CouncilLink[]): Page {
  const place = shortCouncilName(council.name);
  const state = STATE_NAMES[council.state];
  const description = `Find your next bin day in ${place}, ${state}. Type your address to see when ${council.name} collects, and whether it's general waste, recycling or green waste this week.`;
  const { id, name, website, platform } = council;
  return {
    path: councilPath(council),
    title: `${place} bin day: which bins go out this week?`,
    description,
    trail: [
      HOME,
      { name: state, path: statePath(council.state) },
      { name: `${place} bin day`, path: councilPath(council) },
    ],
    data: {
      council: {
        id,
        name,
        state: council.state,
        ...(website ? { website } : {}),
        ...(platform ? { platform } : {}),
      },
      nearby,
    },
    body: [
      `<p>${escapeHtml(description)}</p>`,
      '<h2>How it works</h2>',
      `<ol><li>Type your street address in ${escapeHtml(place)}.</li><li>We look your property up with ${escapeHtml(council.name)}.</li><li>You see your next collection day and which bins to put out, plus the weeks after.</li></ol>`,
      `<p>The dates come from ${escapeHtml(sourceDescription(council))}.${website ? ` ${link(website, `${council.name} website`)}` : ''}</p>`,
      ...(nearby.length
        ? [`<h2>Councils near ${escapeHtml(place)}</h2>`, councilLinks(nearby)]
        : []),
      `<p>${link(statePath(council.state), `All ${state} councils`)}</p>`,
    ],
  };
}

/** The closest other councils to one council, by the middle of each council's area. */
function nearestCouncils(coverage: Coverage, council: CouncilInfo): CouncilLink[] {
  const centres = new Map<string, { link: CouncilLink; centre: [number, number] }>();
  for (const feature of coverage.features) {
    const { council: id, name, state } = feature.properties;
    const bounds = boundsOf(feature.geometry.coordinates);
    if (bounds) centres.set(id, { link: { id, name, state }, centre: centreOf(bounds) });
  }
  const here = centres.get(council.id)?.centre;
  if (!here) return [];
  return [...centres.values()]
    .filter((other) => other.link.id !== council.id)
    .sort((a, b) => distanceKm(here, a.centre) - distanceKm(here, b.centre))
    .slice(0, NEARBY)
    .map((other) => other.link);
}

function sitemap(origin: string, councils: CouncilInfo[]): string {
  const paths = [
    '/',
    ...byState(councils).map(([state]) => statePath(state)),
    ...councils.map(councilPath),
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

  app.get('/sitemap.xml', (c) => text(c, sitemap(origin(c), registry.list()), 'application/xml'));
  app.get('/robots.txt', (c) =>
    text(c, `User-agent: *\nAllow: /\n\nSitemap: ${origin(c)}/sitemap.xml\n`, 'text/plain'),
  );
  app.get('/llms.txt', (c) => text(c, llmsTxt(origin(c), registry.list()), 'text/markdown'));
}
