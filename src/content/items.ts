import type { Article } from './articles.js';
import { binRow } from './illustrations.js';
import { ITEM_DATA } from './items.data.js';
import { escapeHtml, markdownToHtml } from './markdown.js';

/**
 * "Which bin does it go in?" pages, one per household item, each with its sources. The answers are
 * the usual Australian ones; where councils differ, the page says so and points to your own
 * council's bins. Each is a written page (`Article`), so it gets its route, sitemap entry and
 * breadcrumb like any guide.
 */

export const ITEMS_PATH = '/which-bin';
/** When the answers were last checked against their sources. */
const CHECKED = '2026-11-26';

export type ItemBin = 'recycling' | 'general' | 'organics' | 'glass' | 'none';

export interface Item {
  slug: string;
  name: string;
  bin: ItemBin;
  answer: string;
  prepare?: readonly string[];
  varies?: string;
  dropOff?: string;
  sources: ReadonlyArray<{ name: string; url: string }>;
}

export const ITEMS: readonly Item[] = ITEM_DATA;

/** Each bin as the answer card shows it, in the lid colour councils usually paint it. */
const BINS: Record<ItemBin, { name: string; lid: string; colour: string }> = {
  recycling: { name: 'Recycling bin', lid: 'yellow lid', colour: '#fcc419' },
  general: { name: 'General waste bin', lid: 'red lid', colour: '#e03131' },
  organics: { name: 'Organics bin', lid: 'lime green lid', colour: '#82c91e' },
  glass: { name: 'Glass bin', lid: 'purple lid, where your council has one', colour: '#9c36b5' },
  none: { name: 'Not in any bin', lid: 'take it to a drop-off point', colour: '#868e96' },
};

export const itemPath = (item: Pick<Item, 'slug'>) => `${ITEMS_PATH}/${item.slug}`;

/** "Which bin do pizza boxes go in?" */
export function itemQuestion(item: Item, short = false) {
  // "Soft plastics (plastic bags and wrappers)" is plural by its first words.
  const bare = item.name.replace(/\s*\(.*\)$/, '');
  const plural = /s$/.test(bare) && !/ss$/.test(bare);
  // Only the first letter drops to lower case, so "TVs" stays as it is.
  const named = short ? bare : item.name;
  const name = named.charAt(0).toLowerCase() + named.slice(1);
  return `Which bin ${plural ? 'do' : 'does'} ${name} go in?`;
}

const card = (item: Item) => {
  const bin = BINS[item.bin];
  return `<p class="bin-answer" style="--lid:${bin.colour}"><strong>${escapeHtml(bin.name)}</strong> <span>${escapeHtml(bin.lid)}</span></p>`;
};

/** Other items for the same bin, to carry on reading. */
const related = (item: Item) =>
  ITEMS.filter((other) => other.bin === item.bin && other.slug !== item.slug).slice(0, 6);

export function itemArticle(item: Item): Article {
  const others = related(item);
  // The answer itself is the line under the heading, so the body starts after it.
  const body = [
    item.prepare?.length
      ? `## Before it goes in\n\n${item.prepare.map((step) => `- ${step}`).join('\n')}`
      : '',
    item.dropOff ? `## Where to take it\n\n${item.dropOff}` : '',
    item.varies ? `## Does it depend on my council?\n\n${item.varies}` : '',
    `## Check your own bins\n\nCouncils don't all collect the same bins, and some take more than others. [Look up your address](/) to see your bins and your bin day, or read [what each lid colour means](/guides/bin-lid-colours).`,
    `## Sources\n\n${item.sources.map((source) => `- [${source.name}](${source.url})`).join('\n')}`,
    others.length
      ? `## More for the ${BINS[item.bin].name.toLowerCase()}\n\n${others.map((other) => `- [${other.name}](${itemPath(other)})`).join('\n')}`
      : '',
  ].filter(Boolean);
  return {
    path: itemPath(item),
    title: itemQuestion(item),
    seoTitle: `${itemQuestion(item, true)} | Bin Days`,
    // Search results show about 160 characters, so a long answer gives its first sentence.
    description:
      item.answer.length > 160
        ? (item.answer.match(/^.+?\.(?=\s|$)/)?.[0] ?? item.answer)
        : item.answer,
    updated: CHECKED,
    parents: [
      { name: 'Guides', path: '/guides' },
      { name: 'Which bin?', path: ITEMS_PATH },
    ],
    related: [
      '/guides/kids/which-bin',
      '/guides/bin-lid-colours',
      ...(item.bin === 'organics' || item.bin === 'glass' ? ['/guides/fogo-and-glass-bins'] : []),
    ],
    html: card(item) + markdownToHtml(body.join('\n\n')),
    schema: () => [
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: itemQuestion(item),
            acceptedAnswer: {
              '@type': 'Answer',
              text: [item.answer, item.varies].filter(Boolean).join(' '),
            },
          },
        ],
      },
    ],
  };
}

const ORDER: ItemBin[] = ['recycling', 'organics', 'general', 'glass', 'none'];

export const itemsIndex: Article = {
  path: ITEMS_PATH,
  title: 'Which bin does it go in?',
  seoTitle: 'Which bin does it go in? Household items A to Z | Bin Days',
  description:
    'Pizza boxes, batteries, soft plastics, coffee cups and more: which household bin each one goes in in Australia, or where to take it instead.',
  updated: CHECKED,
  parents: [{ name: 'Guides', path: '/guides' }],
  related: [
    '/guides/kids/which-bin',
    '/guides/bin-lid-colours',
    '/guides/fogo-and-glass-bins',
    '/data/bin-collections',
  ],
  html: [
    binRow(
      [
        ['red', 'General waste'],
        ['yellow', 'Recycling'],
        ['lime', 'Organics'],
        ['purple', 'Glass'],
      ],
      'The usual Australian bin lids. Not every home has all four.',
    ),
    markdownToHtml(`These are the usual answers across Australia, each checked against government and recycling sources. Councils differ, so where an answer depends on yours, the page says so. [Look up your address](/) to see the bins you have, or, with the kids, try [Which bin? A guide for kids](/guides/kids/which-bin).

${ORDER.filter((bin) => ITEMS.some((item) => item.bin === bin))
  .map(
    (bin) =>
      `## ${BINS[bin].name}\n\n${ITEMS.filter((item) => item.bin === bin)
        .map((item) => `- [${item.name}](${itemPath(item)})`)
        .join('\n')}`,
  )
  .join('\n\n')}`),
  ].join('\n'),
};

export const ITEM_ARTICLES = ITEMS.map(itemArticle);
