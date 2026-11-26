import type { AustralianState } from '../core/types.js';
import { binsOf, type CouncilBin } from './bins.js';
import { ALL_COUNCILS } from './index.js';
import { STATE_NAMES } from './names.js';
import type { CouncilInfo } from './types.js';

/**
 * Facts about Australia's kerbside bins, worked out from every council Bin Days covers: which bins
 * each collects, how often, and in what lid colour. Each council counts once, as its sample address
 * has its bins (`npm run build:bins`), so these describe the usual service, not every property.
 * Behind the data page (`/data/bin-collections`), its CSV and `GET /v1/stats`.
 */

/** The bins the statistics follow. Organics is garden waste, with or without food scraps. */
export const STAT_BINS = ['general', 'recycling', 'organics', 'glass'] as const;
export type StatBin = (typeof STAT_BINS)[number];

/** How often, in the few groups nearly every council falls into. */
export const FREQUENCIES = ['weekly', 'fortnightly', 'every 4 weeks', 'other'] as const;
export type Frequency = (typeof FREQUENCIES)[number];

/** Lid colours as councils paint them; a council's own word for its bin ("refuse") isn't one. */
const COLOURS = new Set(['red', 'yellow', 'lime', 'green', 'blue', 'purple', 'black']);

export interface BinCount {
  /** Councils that collect this bin. */
  councils: number;
  /** Of those, how many collect it how often. */
  frequency: Record<Frequency, number>;
  /** Of those, how many give it each lid colour ("not stated" where the council doesn't say). */
  colours: Record<string, number>;
}

export interface StateStats {
  state: AustralianState;
  name: string;
  councils: number;
  /** Councils that collect general waste every week. */
  weeklyGeneral: number;
  /** Councils with an organics bin. */
  organics: number;
  /** Councils that take food scraps in the organics bin (or a food bin of its own). */
  fogo: number;
  glass: number;
}

export interface BinStats {
  councils: number;
  bins: Record<StatBin, BinCount>;
  /** Councils that take food scraps (FOGO, or a separate food bin). */
  fogo: number;
  /** How many councils collect 1, 2, 3... kerbside bins. */
  binsPerCouncil: Record<string, number>;
  states: StateStats[];
}

export const frequencyOf = (bin: CouncilBin): Frequency =>
  bin.frequency === 'weekly' || bin.frequency === 'fortnightly'
    ? bin.frequency
    : /\b28\b/.test(bin.frequency)
      ? 'every 4 weeks'
      : 'other';

export const colourOf = (bin: CouncilBin) =>
  bin.colour && COLOURS.has(bin.colour) ? bin.colour : 'not stated';

/** Food scraps go in it: a food bin, or an organics bin the council calls FOGO or food. */
export const takesFood = (bin: Pick<CouncilBin, 'type' | 'name'>) =>
  bin.type === 'food' || (bin.type === 'organics' && /food|fogo/i.test(bin.name));

/** Which of the followed bins this is; a food-only bin counts as organics. */
const statBin = (bin: CouncilBin): StatBin | undefined =>
  bin.type === 'food' ? 'organics' : STAT_BINS.find((type) => type === bin.type);

const add = (tally: Record<string, number>, key: string) => {
  tally[key] = (tally[key] ?? 0) + 1;
};

export function binStats(councils: readonly CouncilInfo[] = ALL_COUNCILS): BinStats {
  const bins = Object.fromEntries(
    STAT_BINS.map((type) => [
      type,
      {
        councils: 0,
        frequency: Object.fromEntries(FREQUENCIES.map((f) => [f, 0])),
        colours: {},
      },
    ]),
  ) as Record<StatBin, BinCount>;
  const binsPerCouncil: Record<string, number> = {};
  const states = new Map<AustralianState, StateStats>();
  let fogo = 0;
  for (const council of councils) {
    const own = binsOf(council.id);
    add(binsPerCouncil, String(own.length));
    // A council with two recycling bins (paper and containers) counts once, by its first.
    const first = new Map<StatBin, CouncilBin>();
    for (const bin of own) {
      const type = statBin(bin);
      if (type && !first.has(type)) first.set(type, bin);
    }
    for (const [type, bin] of first) {
      bins[type].councils++;
      bins[type].frequency[frequencyOf(bin)]++;
      add(bins[type].colours, colourOf(bin));
    }
    const food = own.some(takesFood);
    if (food) fogo++;
    const state = states.get(council.state) ?? {
      state: council.state,
      name: STATE_NAMES[council.state],
      councils: 0,
      weeklyGeneral: 0,
      organics: 0,
      fogo: 0,
      glass: 0,
    };
    state.councils++;
    if (first.get('general')?.frequency === 'weekly') state.weeklyGeneral++;
    if (first.has('organics')) state.organics++;
    if (food) state.fogo++;
    if (first.has('glass')) state.glass++;
    states.set(council.state, state);
  }
  return {
    councils: councils.length,
    bins,
    fogo,
    binsPerCouncil,
    states: [...states.values()].sort((a, b) => b.councils - a.councils),
  };
}

const csvCell = (value: string) =>
  /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

/** One row per council and kerbside bin, for anyone to download and use. */
export function binsCsv(councils: readonly CouncilInfo[] = ALL_COUNCILS): string {
  const rows = [
    [
      'council_id',
      'council',
      'state',
      'bin_type',
      'bin_name',
      'lid_colour',
      'frequency',
      'food_scraps',
    ],
    ...councils.flatMap((council) =>
      binsOf(council.id).map((bin) => [
        council.id,
        council.name,
        council.state,
        bin.type,
        bin.name,
        colourOf(bin),
        bin.frequency,
        takesFood(bin) ? 'yes' : 'no',
      ]),
    ),
  ];
  return `${rows.map((row) => row.map(csvCell).join(',')).join('\n')}\n`;
}
