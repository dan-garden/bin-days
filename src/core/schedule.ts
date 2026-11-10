import { addDays, compareDates, daysBetween } from './date.js';
import type { BinService, CollectionEvent, LocalDate, Recurrence } from './types.js';

/**
 * Expand a recurrence into the dates that fall within `[from, to]` (inclusive).
 */
export function expandRecurrence(
  recurrence: Recurrence,
  from: LocalDate,
  to: LocalDate,
): LocalDate[] {
  if (compareDates(from, to) > 0) return [];

  if (recurrence.kind === 'dates') {
    return [...new Set(recurrence.dates)]
      .filter((d) => compareDates(d, from) >= 0 && compareDates(d, to) <= 0)
      .sort(compareDates);
  }

  const { everyDays, anchor } = recurrence;
  if (!Number.isInteger(everyDays) || everyDays <= 0) {
    throw new RangeError(`Recurrence interval must be a positive integer, got ${everyDays}`);
  }
  // First occurrence on or after `from`, stepping forwards or backwards from the anchor.
  const offset = daysBetween(anchor, from);
  const steps = Math.ceil(offset / everyDays);
  let current = addDays(anchor, steps * everyDays);

  const dates: LocalDate[] = [];
  while (compareDates(current, to) <= 0) {
    dates.push(current);
    current = addDays(current, everyDays);
  }
  return dates;
}

/**
 * How often a service runs, in days. For an explicit date list this is the
 * most common gap, so one holiday-shifted date doesn't hide a fortnightly cycle.
 */
export function intervalDays(recurrence: Recurrence): number | undefined {
  if (recurrence.kind === 'interval') return recurrence.everyDays;
  const dates = [...new Set(recurrence.dates)].sort(compareDates);
  const counts = new Map<number, number>();
  dates.slice(1).forEach((d, i) => {
    const gap = daysBetween(dates[i]!, d);
    counts.set(gap, (counts.get(gap) ?? 0) + 1);
  });
  return [...counts].sort((a, b) => b[1] - a[1])[0]?.[0];
}

/** The dates the council itself stated, rather than ones we calculated. */
function confirmedDates(recurrence: Recurrence): Set<LocalDate> {
  return new Set(recurrence.kind === 'dates' ? recurrence.dates : [recurrence.anchor]);
}

/** All collection events for the given services in `[from, to]`, sorted by date then type. */
export function collectionsInRange(
  services: readonly BinService[],
  from: LocalDate,
  to: LocalDate,
): CollectionEvent[] {
  const events: CollectionEvent[] = [];
  for (const service of services) {
    const confirmed = confirmedDates(service.recurrence);
    for (const date of expandRecurrence(service.recurrence, from, to)) {
      events.push({
        date,
        type: service.type,
        name: service.name,
        ...(service.colour ? { colour: service.colour } : {}),
        confidence: confirmed.has(date) ? 'confirmed' : 'projected',
      });
    }
  }
  return events.sort((a, b) => compareDates(a.date, b.date) || a.type.localeCompare(b.type));
}

/** The next date on or after `from` for a service, searching up to `horizonDays` ahead. */
export function nextCollection(
  service: BinService,
  from: LocalDate,
  horizonDays = 366,
): LocalDate | undefined {
  return expandRecurrence(service.recurrence, from, addDays(from, horizonDays))[0];
}

/** Map council wording ("Collected fortnightly") to an interval in days. */
export function parseFrequency(text: string): number | undefined {
  const s = text.toLowerCase();
  if (/fortnight|every (2|two) weeks|bi-?weekly/.test(s)) return 14;
  if (/every (3|three) weeks/.test(s)) return 21;
  if (/every (4|four) weeks|monthly/.test(s)) return 28;
  if (/week|every [a-z]+day\b/.test(s)) return 7;
  return undefined;
}
