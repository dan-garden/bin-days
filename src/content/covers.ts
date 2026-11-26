import type { Article } from './articles.js';
import { binSvg, LID, type Lid, truckSvg } from './illustrations.js';
import { ITEMS, ITEMS_PATH, type ItemBin } from './items.js';
import { escapeHtml } from './markdown.js';

/**
 * Each written page's share image (og:image): its title on the site's sky, with a drawing for its
 * kind of page. `npm run build:covers` renders these to `web/public/covers/*.png` with headless
 * Chrome, and a test fails if a page has no image yet.
 */

export const COVERS_PATH = '/covers';

/** Where a page's share image is served: `/guides/kids/which-bin` → `/covers/guides-kids-which-bin.png`. */
export const coverPath = (article: Pick<Article, 'path'>) =>
  `${COVERS_PATH}/${article.path.slice(1).replace(/\//g, '-')}.png`;

const ITEM_LID: Record<ItemBin, Lid | undefined> = {
  recycling: 'yellow',
  general: 'red',
  organics: 'lime',
  glass: 'purple',
  none: undefined,
};

const svg = (viewBox: string, body: string) =>
  `<svg viewBox="${viewBox}" width="100%" height="100%" aria-hidden="true">${body}</svg>`;

/** The section label and drawing a page gets, by where it sits on the site. */
function kind(article: Article): { label: string; colour: string; art: string } {
  if (article.path.startsWith(`${ITEMS_PATH}/`)) {
    const item = ITEMS.find((it) => `${ITEMS_PATH}/${it.slug}` === article.path);
    const lid = item && ITEM_LID[item.bin];
    // Nothing goes in a bin: a grey lid, crossed out.
    const art = lid
      ? binSvg(lid, 0, 0, 1)
      : `${binSvg('red', 0, 0, 1).replace(LID.red, '#adb5bd').replace(LID.red, '#adb5bd')}<circle cx="32" cy="42" r="24" fill="none" stroke="#c92a2a" stroke-width="6"/><path d="M15 25l34 34" stroke="#c92a2a" stroke-width="6"/>`;
    return { label: 'Which bin?', colour: '#1e6b30', art: svg('0 6 64 66', art) };
  }
  if (article.path === ITEMS_PATH)
    return { label: 'Which bin?', colour: '#1e6b30', art: binRowArt() };
  if (article.path.startsWith('/guides/kids'))
    return { label: 'For kids', colour: '#862e9c', art: truckSvg('lime', '') };
  if (article.path.startsWith('/data/'))
    return {
      label: 'Data',
      colour: '#0b7285',
      art: svg(
        '0 0 200 160',
        `${[66, 84, 22, 9]
          .map(
            (share, i) =>
              `<rect x="${i * 50 + 6}" y="${150 - share * 1.4}" width="38" height="${share * 1.4}" rx="6" fill="${['#1b5e30', '#3f9a55', '#7dbf8b', '#9c36b5'][i]}"/>`,
          )
          .join('')}<path d="M0 151h200" stroke="#5b4a6b" stroke-width="3"/>`,
      ),
    };
  if (article.path.startsWith('/guides'))
    return { label: 'Guide', colour: '#1e6b30', art: binRowArt() };
  return { label: 'Bin Days', colour: '#1e6b30', art: binRowArt() };
}

const binRowArt = () =>
  svg(
    '0 0 280 80',
    (['red', 'yellow', 'lime', 'purple'] as const)
      .map((lid, i) => binSvg(lid, i * 70, 4, 1))
      .join(''),
  );

/** A whole page, 1200 by 630, for the browser to photograph. `font` is a URL of the site's font. */
export function coverHtml(article: Article, font: string): string {
  const { label, colour, art } = kind(article);
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Overpass; src: url("${font}") format("woff2"); font-weight: 100 900; }
* { box-sizing: border-box; margin: 0; }
body { width: 1200px; height: 630px; overflow: hidden; font-family: Overpass, sans-serif; color: #1d1a24;
  background: linear-gradient(180deg, #d6c6f6 0%, #f6cdd3 60%, #ffe1bf 100%); }
.lids { height: 16px; background: linear-gradient(90deg, #e03131 0 25%, #fcc419 25% 50%, #82c91e 50% 75%, #9c36b5 75%); }
main { display: grid; grid-template-columns: 1fr 360px; gap: 48px; align-items: center; height: 614px; padding: 0 72px; }
.brand { display: flex; align-items: center; gap: 14px; font-size: 34px; font-weight: 800; }
.label { display: inline-block; margin-top: 34px; padding: 6px 18px 4px; border-radius: 999px; color: #fff; background: ${colour}; font-size: 26px; font-weight: 700; }
h1 { margin-top: 18px; font-size: ${article.title.length > 60 ? 54 : 64}px; line-height: 1.06; letter-spacing: -0.02em; font-weight: 800;
  display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
.site { margin-top: 28px; font-size: 28px; font-weight: 600; color: #5b4a6b; }
.art { width: 360px; height: 360px; display: grid; place-items: center; }
.art svg { max-width: 100%; max-height: 100%; }
</style></head><body><div class="lids"></div><main><div>
<div class="brand">${svg('0 0 64 72', binSvg('yellow', 0, 0, 1)).replace('width="100%" height="100%"', 'width="44" height="50"')}Bin Days</div>
<div class="label">${escapeHtml(label)}</div>
<h1>${escapeHtml(article.title)}</h1>
<div class="site">bindays.au</div>
</div><div class="art">${art}</div></main></body></html>`;
}
