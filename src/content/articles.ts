import { binDayCalendar } from './guides/bin-day-calendar.js';
import { lidColours } from './guides/bin-lid-colours.js';
import { fogoAndGlass } from './guides/fogo-and-glass-bins.js';
import { missedCollection } from './guides/missed-bin-collection.js';
import { movingHouse } from './guides/moving-house.js';
import { publicHolidays } from './guides/public-holidays.js';
import { thisWeek } from './guides/what-bins-go-out-this-week.js';
import { ITEM_ARTICLES, itemsIndex } from './items.js';
import { about } from './pages/about.js';
import { binData } from './pages/bin-data.js';
import { contact } from './pages/contact.js';
import { privacy } from './pages/privacy.js';

/**
 * A written page: an article in the guides, or one of the site's own pages
 * (about, privacy, contact). Each lives in its own file under `guides/` or
 * `pages/` and is listed below; that is all it takes to publish one, with its
 * route, sitemap entry and links.
 */
export interface Article {
  /** Where it lives, e.g. `/about` or `/guides/bin-lid-colours`. */
  path: string;
  /** The page's heading. */
  title: string;
  /** Its title in search results and browser tabs, if that should differ from the heading. */
  seoTitle?: string;
  /** One or two sentences: the search result's description, and the line under the heading. */
  description: string;
  /** When its facts were last checked, `YYYY-MM-DD`. */
  updated: string;
  /** The text, in the site's Markdown (see `markdown.ts`). */
  body?: string;
  /** Or HTML already built from it, for a page with charts (see `charts.ts`). */
  html?: string;
  /** The page it sits under in the breadcrumb, if not the home page or the guides. */
  parent?: { name: string; path: string };
  /** Structured data the page adds, given the site's origin. */
  schema?: (origin: string) => object[];
}

export const GUIDES_PATH = '/guides';

/** In the order the guides page lists them. */
export const GUIDES: Article[] = [
  thisWeek,
  binDayCalendar,
  lidColours,
  fogoAndGlass,
  publicHolidays,
  missedCollection,
  movingHouse,
];

export const PAGES: Article[] = [about, privacy, contact];

export const guidesIndex: Article = {
  path: GUIDES_PATH,
  title: 'Bin guides',
  seoTitle: 'Bin guides: bin days, lid colours, holidays and more | Bin Days',
  description:
    'Short, practical guides to bin day in Australia: which bins go out, what the lid colours mean, public holidays and more.',
  updated:
    GUIDES.map((guide) => guide.updated)
      .sort()
      .at(-1) ?? '',
  body: GUIDES.map((guide) => `### [${guide.title}](${guide.path})\n\n${guide.description}`).join(
    '\n\n',
  ),
};

/** Every written page, by its path. */
export const ARTICLES = new Map(
  [...PAGES, guidesIndex, ...GUIDES, binData, itemsIndex, ...ITEM_ARTICLES].map((article) => [
    article.path,
    article,
  ]),
);
