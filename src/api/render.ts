import { escapeHtml } from '../content/markdown.js';
import { councilPath, pageHeading, shortCouncilName, suburbPath } from '../councils/names.js';
import type { CouncilInfo } from '../councils/types.js';
import type { PageData } from './pages.js';

/**
 * Turns a page (see `pages.ts`) into HTML: the UI's built page with the
 * page's own head, structured data, and plain HTML put into it.
 */

export const SITE_NAME = 'Bin Days';
const HEAD = /<!--seo:head-->[\s\S]*?<!--\/seo:head-->/;
const BODY = '<!--seo:body-->';

export { escapeHtml };

/** JSON that is safe inside a `<script>` element. */
const scriptJson = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');

export const link = (href: string, text: string) =>
  `<a href="${escapeHtml(href)}">${escapeHtml(text)}</a>`;

type CouncilLink = Pick<CouncilInfo, 'id' | 'name' | 'state'>;

export const councilLinks = (councils: CouncilLink[]) =>
  `<ul>${councils.map((c) => `<li>${link(councilPath(c), `${shortCouncilName(c.name)} bin day`)}</li>`).join('')}</ul>`;

export const suburbLinks = (council: CouncilLink, suburbs: string[]) =>
  `<ul>${suburbs.map((name) => `<li>${link(suburbPath(council, name), `${name} bin day`)}</li>`).join('')}</ul>`;

/** Questions and answers, as the UI shows them: each answer opens under its question. */
export const faqHtml = (faq: NonNullable<PageData['faq']>) =>
  faq
    .map(
      ({ question, answer }) =>
        `<details><summary>${escapeHtml(question)}</summary>${answer}</details>`,
    )
    .join('\n');

/** The site's own pages, linked from every page. */
const SITE_LINKS = [
  ['/guides', 'Guides'],
  ['/about', 'About'],
  ['/privacy', 'Privacy'],
  ['/contact', 'Contact'],
] as const;

export interface Page {
  path: string;
  /** The title in search results and the browser tab. */
  title: string;
  description: string;
  /** The trail from the home page down to this page, for the breadcrumb. */
  trail: Array<{ name: string; path: string }>;
  data: PageData;
  /** Keep the page out of search results. */
  private?: boolean;
  /** Plain HTML shown until the UI starts, and all that non-JavaScript readers get. */
  body: string[];
  /** Structured data that is particular to this page, given the site's origin. */
  schema?: (origin: string) => object[];
}

/** What every page tells search engines about itself, plus what the page adds. */
function structuredData(origin: string, page: Page): object[] {
  const context = 'https://schema.org';
  const items: object[] = [];
  if (!page.data.heading) {
    // The pages that look an address up are the app itself.
    items.push({
      '@context': context,
      '@type': 'WebApplication',
      name: SITE_NAME,
      url: origin + page.path,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      description: page.description,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'AUD' },
    });
  }
  if (page.trail.length > 1) {
    items.push({
      '@context': context,
      '@type': 'BreadcrumbList',
      itemListElement: page.trail.map((step, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: step.name,
        item: origin + step.path,
      })),
    });
  } else {
    items.push(
      { '@context': context, '@type': 'WebSite', name: SITE_NAME, url: `${origin}/` },
      {
        '@context': context,
        '@type': 'Organization',
        name: SITE_NAME,
        url: `${origin}/`,
        logo: `${origin}/apple-touch-icon.png`,
        sameAs: ['https://github.com/dan-garden/bin-days'],
      },
    );
  }
  return [...items, ...(page.schema?.(origin) ?? [])];
}

export function renderPage(
  shell: string,
  origin: string,
  page: Page,
  councilCount: number,
): string {
  const url = origin + page.path;
  const meta = (attribute: string, name: string, content: string) =>
    `<meta ${attribute}="${name}" content="${escapeHtml(content)}" />`;
  // The UI draws the breadcrumb from the same trail; the home page is always its first step.
  const data: PageData = { ...page.data, trail: page.trail.slice(1), councilCount };
  const head = [
    `<title>${escapeHtml(page.title)}</title>`,
    meta('name', 'description', page.description),
    page.private
      ? meta('name', 'robots', 'noindex')
      : `<link rel="canonical" href="${escapeHtml(url)}" />`,
    meta('property', 'og:type', page.data.article ? 'article' : 'website'),
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
    ...structuredData(origin, page).map(
      (item) => `<script type="application/ld+json">${scriptJson(item)}</script>`,
    ),
    `<script id="page-data" type="application/json">${scriptJson(data)}</script>`,
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
  const siteLinks = `<p>${SITE_LINKS.map(([path, name]) => link(path, name)).join(' · ')}</p>`;
  const shellHtml = `<div class="shell">
<div class="shell-topbar">${link('/', SITE_NAME)}</div>
${trail}
<div class="hero${page.trail.length > 1 ? ' hero-compact' : ''}${page.data.address ? ' hero-answered' : ''}">
<div class="shell-bins"></div>
<h1 class="hero-title">${escapeHtml(title)}</h1>
<p class="hero-lede">${escapeHtml(lede)}</p>
</div>
</div>
<div class="seo-more">${[...page.body, siteLinks].join('\n')}</div>`;
  return shell.replace(HEAD, () => head).replace(BODY, () => shellHtml);
}
