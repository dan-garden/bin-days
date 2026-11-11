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
  // Fewer than three letters is not a weekday ("" would otherwise read as Sunday).
  const i = n.length < 3 ? -1 : WEEKDAYS.findIndex((d) => d.toLowerCase().startsWith(n));
  return i === -1 ? undefined : i;
}

/** The first date on or after `today` that falls on the named weekday ("Thursday", "thu"). */
export function nextWeekday(name: string, today: LocalDate): LocalDate | undefined {
  const day = parseWeekday(name);
  return day === undefined ? undefined : addDays(today, (day - weekdayIndex(today) + 7) % 7);
}

/** The named weekday in the same Monday-to-Sunday week as `date`. */
export function weekdayInWeekOf(name: string, date: LocalDate): LocalDate | undefined {
  const day = parseWeekday(name);
  if (day === undefined) return undefined;
  const monday = addDays(date, -((weekdayIndex(date) + 6) % 7));
  return addDays(monday, (day + 6) % 7);
}

/** Seconds left in the day in the given timezone. At least 60, so it can be used as a cache lifetime. */
export function secondsUntilMidnight(timeZone: string, now: Date = new Date()): number {
  const [hours = 0, minutes = 0, seconds = 0] = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })
    .format(now)
    .split(':')
    .map(Number);
  return Math.max(60, 86_400 - (hours * 3600 + minutes * 60 + seconds));
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
 * `13-11-2026`, `Friday 13 November 2026`, `13 Nov 2026` or `13-Nov-2026`.
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

  const named = /(\d{1,2})(?:st|nd|rd|th)?[\s-]+([A-Za-z]{3,})\.?,?[\s-]+(\d{4})/.exec(s);
  if (named) {
    const month = MONTHS.indexOf(named[2]!.slice(0, 3).toLowerCase()) + 1;
    if (month > 0) return safe(Number(named[3]), month, Number(named[1]));
  }
  return undefined;
}

/** Parse a date given without its year ("Tuesday 17th November") as the one nearest `today`. */
export function parseDateNear(text: string, today: LocalDate): LocalDate | undefined {
  const year = Number(today.slice(0, 4));
  return [year - 1, year, year + 1]
    .map((y) => parseAustralianDate(`${text.trim()} ${y}`))
    .filter((date) => date !== undefined)
    .sort((a, b) => Math.abs(daysBetween(today, a)) - Math.abs(daysBetween(today, b)))[0];
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
