import type { LocalDate } from './types.js';

/**
 * Timezone-safe calendar-date helpers.
 *
 * Bin days are calendar dates, not instants. All arithmetic is done on UTC
 * midnight so DST and the server's own timezone can never shift a day. (The
 * old implementation used `new Date()` in server-local time, which gives the
 * wrong "today" on a UTC server for half the Australian day.)
 */

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 86_400_000;
const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export type Weekday = (typeof WEEKDAYS)[number];

export function isLocalDate(value: string): value is LocalDate {
  const m = ISO_DATE.exec(value);
  if (!m) return false;
  const [, y, mo, d] = m.map(Number) as [number, number, number, number];
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d;
}

export function toLocalDate(value: string): LocalDate {
  if (!isLocalDate(value)) throw new RangeError(`Invalid date "${value}", expected YYYY-MM-DD`);
  return value;
}

export function localDate(year: number, month: number, day: number): LocalDate {
  return toLocalDate(
    `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
  );
}

function toUtcMs(date: LocalDate): number {
  return Date.parse(`${date}T00:00:00Z`);
}

function fromUtcMs(ms: number): LocalDate {
  return new Date(ms).toISOString().slice(0, 10) as LocalDate;
}

export function addDays(date: LocalDate, days: number): LocalDate {
  return fromUtcMs(toUtcMs(date) + days * MS_PER_DAY);
}

/** Whole days from `a` to `b` (positive if `b` is later). */
export function daysBetween(a: LocalDate, b: LocalDate): number {
  return Math.round((toUtcMs(b) - toUtcMs(a)) / MS_PER_DAY);
}

export function weekday(date: LocalDate): Weekday {
  return WEEKDAYS[new Date(toUtcMs(date)).getUTCDay()] as Weekday;
}

/** Day of week index, 0 = Sunday. */
export function weekdayIndex(date: LocalDate): number {
  return new Date(toUtcMs(date)).getUTCDay();
}

export function parseWeekday(name: string): number | undefined {
  const n = name.trim().toLowerCase().slice(0, 3);
  const i = WEEKDAYS.findIndex((d) => d.toLowerCase().startsWith(n));
  return i === -1 ? undefined : i;
}

/** Today's date in the given IANA timezone, e.g. `Australia/Brisbane`. */
export function today(timeZone: string, now: Date = new Date()): LocalDate {
  // en-CA formats as YYYY-MM-DD.
  return toLocalDate(
    new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now),
  );
}

/**
 * Parse Australian day-first dates such as `13/11/2026`, `Fri 13/11/2026`,
 * `13-11-2026`, `Friday 13 November 2026` or `13 Nov 2026`.
 */
export function parseAustralianDate(text: string): LocalDate | undefined {
  const s = text.trim();
  const iso = /(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (iso) return safe(Number(iso[1]), Number(iso[2]), Number(iso[3]));

  const numeric = /(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})/.exec(s);
  if (numeric) {
    let year = Number(numeric[3]);
    if (year < 100) year += 2000;
    return safe(year, Number(numeric[2]), Number(numeric[1]));
  }

  const named = /(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]{3,})\.?,?\s+(\d{4})/.exec(s);
  if (named) {
    const month = MONTHS.indexOf(named[2]!.slice(0, 3).toLowerCase()) + 1;
    if (month > 0) return safe(Number(named[3]), month, Number(named[1]));
  }
  return undefined;
}

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

function safe(y: number, m: number, d: number): LocalDate | undefined {
  try {
    return localDate(y, m, d);
  } catch {
    return undefined;
  }
}

export function compareDates(a: LocalDate, b: LocalDate): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
