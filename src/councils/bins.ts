import { COUNCIL_BINS, type CouncilBin } from './bins.generated.js';

export type { CouncilBin };

/** The kinds of bin that go out at the kerb every week or so; hard waste and the like aren't. */
const KERBSIDE = new Set(['general', 'recycling', 'organics', 'food', 'glass']);

/**
 * The kerbside bins a council collects, as its sample address has them
 * (`npm run build:bins`). Most of its properties have the same; some differ.
 */
export const binsOf = (councilId: string): CouncilBin[] =>
  (COUNCIL_BINS[councilId] ?? []).filter((bin) => KERBSIDE.has(bin.type));

/**
 * How often a bin is collected, to finish "collected ...": "every week", "every 4 weeks".
 * Nothing for a council that only gives the next date.
 */
export function howOften(frequency: CouncilBin['frequency']): string {
  if (frequency === 'weekly') return 'every week';
  if (frequency === 'fortnightly') return 'every fortnight';
  const days = Number(/\d+/.exec(frequency)?.[0]);
  if (days && days % 7 === 0) return `every ${days / 7} weeks`;
  return days ? `every ${days} days` : '';
}

/** "general waste every week, recycling every fortnight and FOGO every week" */
export const describeBins = (bins: CouncilBin[]) =>
  joinList(bins.map((bin) => `${binLabel(bin.name)} ${howOften(bin.frequency)}`.trim()));

/** "general waste and recycling" */
export const listBins = (bins: CouncilBin[]) => joinList(bins.map((bin) => binLabel(bin.name)));

/** A council's name for a bin, mid-sentence: "General Waste" reads "general waste", "FOGO" stays. */
const binLabel = (name: string) => name.replace(/\b[A-Z][a-z]+\b/g, (word) => word.toLowerCase());

const joinList = (parts: string[]) =>
  parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}` : (parts[0] ?? '');

/** A lid colour as people say it: "lime" is "lime green". */
export const lidColour = (colour: string) => (colour === 'lime' ? 'lime green' : colour);
