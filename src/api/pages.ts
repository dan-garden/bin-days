import type { Article } from '../content/articles.js';
import { GUIDES, GUIDES_PATH } from '../content/articles.js';
import { type Faq, placeFaq } from '../content/faq.js';
import { markdownToHtml, plainText } from '../content/markdown.js';
import type { AustralianState } from '../core/types.js';
import { AUSTRALIAN_STATES } from '../core/types.js';
import { binsOf, type CouncilBin, describeBins, howOften, lidColour } from '../councils/bins.js';
import {
  addressPath,
  councilPath,
  STATE_NAMES,
  shortCouncilName,
  sourceDescription,
  statePath,
  suburbPath,
} from '../councils/names.js';
import { nearestSuburbs, type Suburb, suburbsOf } from '../councils/suburbs.js';
import type { CouncilInfo } from '../councils/types.js';
import { boundsOf, centreOf, distanceKm } from '../geo/bounds.js';
import type { Coverage } from '../service.js';
import {
  councilLinks,
  escapeHtml,
  faqHtml,
  link,
  type Page,
  SITE_NAME,
  suburbLinks,
} from './render.js';

/**
 * Every kind of page on the website, each built from the council registry and
 * the site's written content: what it says in its head, the plain HTML for
 * readers without JavaScript, and the data the UI draws the page from.
 */

type CouncilLink = Pick<CouncilInfo, 'id' | 'name' | 'state'>;

/** What the UI needs to know about the page it was served on. */
export interface PageData {
  /** The breadcrumb after the home page; the last step is this page. */
  trail?: Array<{ name: string; path: string }>;
  /** The page's own heading and introduction, on pages that aren't about a place. */
  heading?: { title: string; lede: string };
  /** Set on a state's page. */
  state?: AustralianState;
  /** Set on a shared link to one address, which the UI looks up straight away. */
  address?: string;
  /** Set on a council's page. */
  council?: Pick<CouncilInfo, 'id' | 'name' | 'state' | 'website' | 'platform'>;
  /** The closest other councils, nearest first. */
  nearby?: CouncilLink[];
  /** Set on a suburb's page, along with its council. */
  suburb?: Suburb;
  /** Suburbs to link to: all of the council's on its own page, the nearest ones on a suburb's. */
  suburbs?: string[];
  /** The bins the council collects, on its pages and its suburbs'. */
  bins?: CouncilBin[];
  /** Common questions, with answers as HTML. */
  faq?: Faq[];
  /** A written page's text as HTML, and when it was last checked (`YYYY-MM-DD`). */
  article?: { html: string; updated: string };
  /** Every supported council, on the pages that list them, so the UI needn't fetch them. */
  councils?: CouncilLink[];
  /** How many councils are supported. The UI asks for the coverage map by this number, so a
   * browser's saved copy is not reused once a council has been added. */
  councilCount?: number;
}

const HOME = { name: SITE_NAME, path: '/' };
/** How many neighbouring councils a council's page links to. */
const NEARBY = 6;
/** How many nearby suburbs a suburb's page links to. */
const NEARBY_SUBURBS = 12;

const asLink = ({ id, name, state }: CouncilLink): CouncilLink => ({ id, name, state });

/** States that have at least one council, biggest first, each with its councils. */
export function byState(councils: CouncilInfo[]): Array<[AustralianState, CouncilInfo[]]> {
  return AUSTRALIAN_STATES.map((state): [AustralianState, CouncilInfo[]] => [
    state,
    councils.filter((c) => c.state === state),
  ])
    .filter(([, list]) => list.length > 0)
    .sort((a, b) => b[1].length - a[1].length);
}

export function homePage(councils: CouncilInfo[]): Page {
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
export function addressPage(address: string, councils: CouncilInfo[]): Page {
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

export function statePage(state: AustralianState, councils: CouncilInfo[]): Page {
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

/** What a council's page and its suburbs' pages share: the council, its bins and the questions. */
function placeData(council: CouncilInfo, suburb?: Suburb): PageData {
  const { id, name, website, platform } = council;
  const bins = binsOf(id);
  return {
    council: {
      id,
      name,
      state: council.state,
      ...(website ? { website } : {}),
      ...(platform ? { platform } : {}),
    },
    ...(suburb ? { suburb } : {}),
    ...(bins.length ? { bins } : {}),
    faq: placeFaq({ council, suburb }).map(({ question, answer }) => ({
      question,
      answer: markdownToHtml(answer),
    })),
  };
}

/** The bins and how often each goes, as a list. */
const binsHtml = (bins: CouncilBin[]) =>
  `<ul>${bins
    .map((bin) => {
      const lid = bin.colour ? ` (${lidColour(bin.colour)} lid)` : '';
      const often = howOften(bin.frequency);
      return `<li>${escapeHtml(`${bin.name}${lid}${often ? `: ${often}` : ''}`)}</li>`;
    })
    .join('')}</ul>`;

/** The council as a service search engines can describe, for the area a page is about. */
function serviceSchema(council: CouncilInfo, place: string, areaServed: object): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'GovernmentService',
    name: `${place} household bin collection`,
    serviceType: 'Household waste and recycling collection',
    provider: {
      '@type': 'GovernmentOrganization',
      name: council.name,
      ...(council.website ? { url: council.website } : {}),
    },
    areaServed,
  };
}

const faqSchema = (faq: Faq[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map(({ question, answer }) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: { '@type': 'Answer', text: plainText(answer) },
  })),
});

/** The parts of a council or suburb page's text that say what the bins are and answer questions. */
function placeBody(data: PageData, where: string): string[] {
  return [
    ...(data.bins?.length
      ? [`<h2>Bins collected in ${escapeHtml(where)}</h2>`, binsHtml(data.bins)]
      : []),
    ...(data.faq?.length ? ['<h2>Common questions</h2>', faqHtml(data.faq)] : []),
  ];
}

export function councilPage(council: CouncilInfo, nearby: CouncilLink[]): Page {
  const place = shortCouncilName(council.name);
  const state = STATE_NAMES[council.state];
  const data: PageData = {
    ...placeData(council),
    nearby,
    suburbs: suburbsOf(council.id).map((s) => s.name),
  };
  const collects = data.bins?.length ? ` ${council.name} collects ${describeBins(data.bins)}.` : '';
  const description = `When is bin day in ${place}?${collects} Type your address to see your day and which bins go out this week.`;
  return {
    path: councilPath(council),
    title: `${place} bin days & bin collection calendar | ${council.state}`,
    description,
    trail: [
      HOME,
      { name: state, path: statePath(council.state) },
      { name: `${place} bin day`, path: councilPath(council) },
    ],
    data,
    body: [
      `<p>${escapeHtml(description)}</p>`,
      '<h2>How it works</h2>',
      `<ol><li>Type your street address in ${escapeHtml(place)}.</li><li>We look your property up with ${escapeHtml(council.name)}.</li><li>You see your next collection day and which bins to put out, plus the weeks after.</li></ol>`,
      `<p>The dates come from ${escapeHtml(sourceDescription(council))}.${council.website ? ` ${link(council.website, `${council.name} website`)}` : ''}</p>`,
      ...placeBody(data, place),
      ...(data.suburbs?.length
        ? [`<h2>Suburbs in ${escapeHtml(place)}</h2>`, suburbLinks(council, data.suburbs)]
        : []),
      ...(nearby.length
        ? [`<h2>Councils near ${escapeHtml(place)}</h2>`, councilLinks(nearby)]
        : []),
      `<p>${link(statePath(council.state), `All ${state} councils`)}</p>`,
    ],
    schema: () => [
      serviceSchema(council, place, {
        '@type': 'AdministrativeArea',
        name: `${place}, ${state}`,
      }),
      ...(data.faq?.length ? [faqSchema(data.faq)] : []),
    ],
  };
}

export function suburbPage(council: CouncilInfo, suburb: Suburb): Page {
  const place = shortCouncilName(council.name);
  const state = STATE_NAMES[council.state];
  const nearby = nearestSuburbs(council.id, suburb, NEARBY_SUBURBS).map((other) => other.name);
  const data: PageData = { ...placeData(council, suburb), suburbs: nearby };
  const postcode = suburb.postcode ? ` (${suburb.postcode})` : '';
  const collects = data.bins?.length ? ` ${council.name} collects ${describeBins(data.bins)}.` : '';
  const description = `When is bin day in ${suburb.name}${postcode}?${collects} Type your address to see your exact day and which bins go out this week.`;
  const path = suburbPath(council, suburb.name);
  return {
    path,
    title: `${suburb.name} bin day & bin collection | ${place} ${council.state}${suburb.postcode ? ` ${suburb.postcode}` : ''}`,
    description,
    trail: [
      HOME,
      { name: state, path: statePath(council.state) },
      { name: `${place} bin day`, path: councilPath(council) },
      { name: suburb.name, path },
    ],
    data,
    body: [
      `<p>${escapeHtml(description)}</p>`,
      `<p>${escapeHtml(suburb.name)} is in the ${escapeHtml(council.name)} area${suburb.postcode ? `, postcode ${suburb.postcode}` : ''}. The dates come from ${escapeHtml(sourceDescription(council))}. Collection days can differ from street to street, so the answer is for your own address.</p>`,
      ...placeBody(data, suburb.name),
      ...(nearby.length
        ? [`<h2>Suburbs near ${escapeHtml(suburb.name)}</h2>`, suburbLinks(council, nearby)]
        : []),
      `<p>${link(councilPath(council), `All of ${place}`)}</p>`,
    ],
    schema: () => [
      serviceSchema(council, suburb.name, {
        '@type': 'Place',
        name: suburb.name,
        address: {
          '@type': 'PostalAddress',
          addressLocality: suburb.name,
          addressRegion: council.state,
          ...(suburb.postcode ? { postalCode: suburb.postcode } : {}),
          addressCountry: 'AU',
        },
        geo: { '@type': 'GeoCoordinates', latitude: suburb.latitude, longitude: suburb.longitude },
      }),
      ...(data.faq?.length ? [faqSchema(data.faq)] : []),
    ],
  };
}

/** A written page: a guide, the guides list, or one of the site's own pages. */
export function articlePage(article: Article): Page {
  const isGuide = article.path.startsWith(`${GUIDES_PATH}/`);
  const html = article.html ?? markdownToHtml(article.body ?? '');
  // A guide ends with the other guides, so a reader (and a crawler) can carry on.
  const others = isGuide ? GUIDES.filter((guide) => guide.path !== article.path) : [];
  const more = others.length
    ? `\n<h2>More guides</h2>\n<ul>${others.map((guide) => `<li>${link(guide.path, guide.title)}</li>`).join('')}</ul>`
    : '';
  return {
    path: article.path,
    title: article.seoTitle ?? `${article.title} | ${SITE_NAME}`,
    description: article.description,
    trail: [
      HOME,
      ...(isGuide ? [{ name: 'Guides', path: GUIDES_PATH }] : []),
      ...(article.parent ? [article.parent] : []),
      { name: article.title, path: article.path },
    ],
    data: {
      heading: { title: article.title, lede: article.description },
      article: { html: html + more, updated: article.updated },
    },
    body: [html + more],
    schema: (origin) => [
      {
        '@context': 'https://schema.org',
        '@type': isGuide ? 'Article' : 'WebPage',
        headline: article.title,
        description: article.description,
        dateModified: article.updated,
        url: origin + article.path,
        author: { '@id': `${origin}/#organization` },
        publisher: { '@id': `${origin}/#organization` },
        isPartOf: { '@id': `${origin}/#website` },
      },
      ...(article.schema?.(origin) ?? []),
    ],
  };
}

/** The closest other councils to one council, by the middle of each council's area. */
export function nearestCouncils(coverage: Coverage, council: CouncilInfo): CouncilLink[] {
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
