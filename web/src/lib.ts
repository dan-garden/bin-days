import type { AustralianState, BinType } from '../../src/core/types.js';

/** Pure helpers for the UI: dates, bin colours and map geometry. No DOM, so they're unit tested. */

const DAY_MS = 86_400_000;

/** Whole days from `today` to `date` (both `YYYY-MM-DD`). */
export function daysUntil(date: string, today: string): number {
  return Math.round((Date.parse(date) - Date.parse(today)) / DAY_MS);
}

export function relativeDay(date: string, today: string): string {
  const days = daysUntil(date, today);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}

/**
 * Format a `YYYY-MM-DD` date. It's read as UTC and printed as UTC, so the
 * calendar day never shifts with the viewer's timezone.
 */
export function formatDate(date: string, options: Intl.DateTimeFormatOptions): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-AU', { timeZone: 'UTC', ...options });
}

/** Lid colours as the API names them, as paint. */
const LID_PAINT: Record<string, string> = {
  red: '#e03131',
  yellow: '#fcc419',
  lime: '#82c91e',
  green: '#2f9e44',
  purple: '#9c36b5',
  blue: '#228be6',
};

/** The usual Australian lid for each bin type, for when a council doesn't say. */
const USUAL_LID: Partial<Record<BinType, string>> = {
  general: 'red',
  recycling: 'yellow',
  organics: 'lime',
  food: 'lime',
  glass: 'purple',
};

export function lidPaint(bin: { type: BinType; colour?: string | undefined }): string {
  return LID_PAINT[bin.colour ?? ''] ?? LID_PAINT[USUAL_LID[bin.type] ?? ''] ?? '#868e96';
}

/** Group councils by state, biggest group first. */
export function groupByState<T extends { state: AustralianState; name: string }>(
  councils: readonly T[],
): Array<[AustralianState, T[]]> {
  const groups = new Map<AustralianState, T[]>();
  for (const council of councils) {
    groups.set(council.state, [...(groups.get(council.state) ?? []), council]);
  }
  return [...groups]
    .map(([state, list]): [AustralianState, T[]] => [
      state,
      list.sort((a, b) => a.name.localeCompare(b.name)),
    ])
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
}
