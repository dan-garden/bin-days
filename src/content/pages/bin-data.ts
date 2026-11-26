import { binsOf, lidColour } from '../../councils/bins.js';
import { ALL_COUNCILS } from '../../councils/index.js';
import { statePath } from '../../councils/names.js';
import { binStats, FREQUENCIES, STAT_BINS, type StatBin } from '../../councils/stats.js';
import type { Article } from '../articles.js';
import { shareBars, stackedBars, stats, table } from '../charts.js';
import { markdownToHtml } from '../markdown.js';

export const DATA_PATH = '/data/bin-collections';
export const DATA_CSV = `${DATA_PATH}.csv`;
/** When `npm run build:bins` last asked every council; update it with each run. */
const CHECKED = '2026-11-26';

const NAMES: Record<StatBin, string> = {
  general: 'General waste',
  recycling: 'Recycling',
  organics: 'Organics (garden or FOGO)',
  glass: 'Glass',
};

const s = binStats();
const share = (part: number, whole = s.councils) => Math.round((part / whole) * 100);
const { general, recycling, organics, glass } = s.bins;
const md = markdownToHtml;
const fortnightlyWithWeeklyOrganics = ALL_COUNCILS.filter((council) => {
  const bins = binsOf(council.id);
  return (
    bins.find((bin) => bin.type === 'general')?.frequency === 'fortnightly' &&
    bins.some((bin) => bin.type === 'organics' && bin.frequency === 'weekly')
  );
}).length;

const colours = (type: StatBin) =>
  Object.entries(s.bins[type].colours)
    .sort(([, a], [, b]) => b - a)
    .map(([colour, count]) => `${lidColour(colour)} ${count}`)
    .join(', ');

const html = [
  md(`
Of the **${s.councils} Australian councils** Bin Days covers, **${share(general.frequency.weekly)}% collect general waste every week**, **${share(recycling.frequency.fortnightly)}% collect recycling every fortnight**, and **${share(organics.councils)}% have an organics bin**. ${s.fogo} councils (${share(s.fogo)}%) take food scraps in it (FOGO), and ${glass.councils} have a separate glass bin, all of them in Victoria.

The figures come from each council's own bin day service, as Bin Days reads it for one sample address per council, last checked on ${new Date(CHECKED).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}. They describe the usual service in each area: some homes have other bins, or extra ones on request. [Download the data](${DATA_CSV}) or use it from the [API](/docs).`),
  stats([
    { value: String(s.councils), label: 'councils' },
    { value: `${share(general.frequency.weekly)}%`, label: 'weekly general waste' },
    { value: `${share(organics.councils)}%`, label: 'have an organics bin' },
    { value: String(s.fogo), label: 'take food scraps (FOGO)' },
  ]),
  md(`
## Key findings

- **General waste is usually weekly, but not everywhere.** ${general.frequency.weekly} councils collect it every week and ${general.frequency.fortnightly} every fortnight. Of those, ${fortnightlyWithWeeklyOrganics} collect their organics bin every week instead.
- **Recycling is almost always fortnightly.** ${recycling.frequency.fortnightly} of ${recycling.councils} councils collect it every second week; only ${recycling.frequency.weekly} collect it weekly.
- **Three bins is the norm.** ${s.binsPerCouncil['3'] ?? 0} councils (${share(s.binsPerCouncil['3'] ?? 0)}%) collect three kerbside bins, usually general waste, recycling and organics.
- **FOGO is spreading fastest in Victoria.** ${s.states.find((state) => state.state === 'VIC')?.fogo ?? 0} Victorian councils already take food scraps, ahead of the state's 2030 deadline.
- **Glass bins are a Victorian thing, for now.** All ${glass.councils} councils covered with a purple-lid glass bin are in Victoria, mostly collected every four weeks.

## How often each bin is collected`),
  stackedBars(
    'Councils by how often they collect each bin',
    ['Every week', 'Every fortnight', 'Every 4 weeks', 'Other or dates only'],
    STAT_BINS.map((type) => ({
      label: NAMES[type],
      values: FREQUENCIES.map((frequency) => s.bins[type].frequency[frequency]),
    })),
    '"Other or dates only" is a council that publishes dates rather than a fixed cycle. The number at the end of each bar is how many councils collect that bin.',
  ),
  md('## Organics and food scraps, by state'),
  shareBars(
    'Councils that take food scraps (FOGO)',
    s.states.map((state) => ({
      label: { text: state.name, href: statePath(state.state) },
      value: state.fogo,
      of: state.councils,
    })),
  ),
  shareBars(
    'Councils with an organics bin',
    s.states.map((state) => ({
      label: { text: state.name, href: statePath(state.state) },
      value: state.organics,
      of: state.councils,
    })),
  ),
  md(`## Every state at a glance

Bin Days covers more councils in some states than others, so a state with few councils covered may not reflect the whole state.`),
  table(
    ['State', 'Councils', 'Weekly general waste', 'Organics bin', 'FOGO', 'Glass bin'],
    s.states.map((state) => [
      { text: state.name, href: statePath(state.state) },
      state.councils,
      `${share(state.weeklyGeneral, state.councils)}%`,
      `${share(state.organics, state.councils)}%`,
      `${share(state.fogo, state.councils)}%`,
      `${share(state.glass, state.councils)}%`,
    ]),
    'Share of councils covered in each state',
  ),
  md(`## Lid colours

Nearly every council uses the same lid colours: red for general waste, yellow for recycling, lime green for organics and purple for glass. A few still use older colours, such as a dark green organics lid. [What each lid colour means](/guides/bin-lid-colours).`),
  table(
    ['Bin', 'Lid colours (councils)'],
    STAT_BINS.map((type) => [NAMES[type], colours(type)]),
  ),
  md(`## How many bins each council collects`),
  shareBars(
    'Councils by number of kerbside bins',
    Object.entries(s.binsPerCouncil)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([count, councils]) => ({
        label: `${count} ${count === '1' ? 'bin' : 'bins'}`,
        value: councils,
        of: s.councils,
      })),
  ),
  md(`## Use this data

- [Download the data as CSV](${DATA_CSV}): one row per council and bin, with its lid colour, how often it's collected and whether it takes food scraps.
- [The same figures as JSON](/v1/stats), from the free API. [API documentation](/docs).
- The data is free to use under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Please credit **Bin Days (bindays.au)**.

## How it was collected

Bin Days reads each council's own bin day service: a lookup on its website, a map, a data file or a calendar. For these figures it asks each council about one sample address and records the kerbside bins that come back, their lid colours and how often each is collected. Hard waste and other bookable services are left out. A council counts once per kind of bin, so one with separate paper and container recycling bins counts once for recycling.

[Find your own bin day](/), or read [which councils have a FOGO or glass bin](/guides/fogo-and-glass-bins).`),
].join('\n');

export const binData: Article = {
  path: DATA_PATH,
  title: 'Australian bin collection data',
  seoTitle: 'Australian bin collection data and statistics | Bin Days',
  description: `How often ${s.councils} Australian councils collect each bin, which take food scraps, and their lid colours, with free data to download.`,
  updated: CHECKED,
  related: ['/guides/fogo-and-glass-bins', '/guides/bin-lid-colours', '/which-bin', '/guides/kids'],
  parents: [{ name: 'Guides', path: '/guides' }],
  html,
  schema: (origin) => [
    {
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      name: 'Australian kerbside bin collections by council',
      description: `The kerbside bins ${s.councils} Australian councils collect, with each bin's lid colour, how often it is collected and whether it takes food scraps, from each council's own bin day service.`,
      url: origin + DATA_PATH,
      keywords: ['bin collection', 'waste', 'recycling', 'FOGO', 'councils', 'Australia'],
      license: 'https://creativecommons.org/licenses/by/4.0/',
      isAccessibleForFree: true,
      dateModified: CHECKED,
      spatialCoverage: { '@type': 'Place', name: 'Australia' },
      creator: { '@id': `${origin}/#organization` },
      distribution: [
        { '@type': 'DataDownload', encodingFormat: 'text/csv', contentUrl: origin + DATA_CSV },
        {
          '@type': 'DataDownload',
          encodingFormat: 'application/json',
          contentUrl: `${origin}/v1/stats`,
        },
      ],
    },
  ],
};
