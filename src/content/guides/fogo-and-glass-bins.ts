import { binsOf } from '../../councils/bins.js';
import { ALL_COUNCILS } from '../../councils/index.js';
import { councilPath, STATE_NAMES, shortCouncilName } from '../../councils/names.js';
import type { CouncilInfo } from '../../councils/types.js';
import type { Article } from '../articles.js';

/** Councils whose bins include one matching the test, grouped by state, as Markdown lists. */
function councilsWith(test: (bin: { type: string; name: string }) => boolean): string {
  const found = ALL_COUNCILS.filter((council) => binsOf(council.id).some(test));
  const byState = new Map<string, CouncilInfo[]>();
  for (const council of found)
    byState.set(council.state, [...(byState.get(council.state) ?? []), council]);
  return [...byState]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(
      ([state, councils]) =>
        `**${STATE_NAMES[state as CouncilInfo['state']]}:** ${councils
          .map((council) => `[${shortCouncilName(council.name)}](${councilPath(council)})`)
          .sort()
          .join(', ')}`,
    )
    .join('\n\n');
}

const food = (bin: { type: string; name: string }) =>
  bin.type === 'food' || (bin.type === 'organics' && /food|fogo/i.test(bin.name));

export const fogoAndGlass: Article = {
  path: '/guides/fogo-and-glass-bins',
  title: 'Which councils have a FOGO or glass bin?',
  seoTitle: 'FOGO and glass bins: which councils have them | Bin Days',
  description:
    'Food scraps in the green bin, and a purple bin for glass: which councils covered by Bin Days collect them, from what each council told us.',
  updated: '2026-11-25',
  related: ['/data/bin-collections', '/which-bin/food-scraps', '/which-bin/glass-bottles-and-jars'],
  body: `
More councils are adding two kinds of bin:

- **FOGO (food organics, garden organics):** a lime green bin for food scraps as well as garden waste. Some councils use a small kitchen caddy for food instead.
- **Glass:** a purple bin just for glass bottles and jars, which then stay out of the yellow recycling bin.

The lists below come from each council's own answer for a sample address, so they show the usual service. Some properties in these areas don't have the bin, and other councils may have started since. [Look up your address](/) to see your own bins.

## Councils with food scraps in the organics bin

${councilsWith(food)}

## Councils with a glass bin

${councilsWith((bin) => bin.type === 'glass')}
`,
};
