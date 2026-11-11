import { nextWeekday, parseAustralianDate, toLocalDate, weekdayInWeekOf } from '../core/date.js';
import { binService } from '../core/schedule.js';
import type { BinService, BinType, LocalDate } from '../core/types.js';

/**
 * How one bin is read from a collection zone's fields, whichever kind of map
 * the zone came from. A bin's dates come in one of two ways:
 *
 * - a field holding one of its collection dates (`dateField`), or
 * - a field holding its weekday (`dayField`). That is enough for a weekly bin.
 *   A fortnightly one also needs `weekOf`: a date in a week it is collected.
 *   Take that from the council's own material (its calendar, or the formula in
 *   its public map), never from a guess: "Monday, week 2" means nothing
 *   without a date to count from.
 *
 * With both fields, the date only says which week: the bin goes out on its weekday in that week.
 */
export interface ZoneBin {
  type: BinType;
  name: string;
  /** The field holding a collection date: text in any usual form, or a timestamp. */
  dateField?: string;
  /** The field holding the bin's weekday. */
  dayField?: string;
  /**
   * With `dayField`, a date (`YYYY-MM-DD`) in a week the bin is collected. Where the council's
   * areas alternate, one for each value of the zone's `weekField`.
   */
  weekOf?: string | Record<string, string>;
  /** The cycle in days, or the field that holds it in weeks. */
  everyDays?: number;
  weeksField?: string;
}

/**
 * The fields of the Open Council Data "garbage collection zones" standard, which many
 * Victorian councils publish: a weekday, a start date and a cycle in weeks for each bin.
 */
export const OPEN_COUNCIL_BINS: ZoneBin[] = (
  [
    ['general', 'General waste', 'rub'],
    ['recycling', 'Recycling', 'rec'],
    ['organics', 'Food and garden organics', 'grn'],
    ['glass', 'Glass', 'gls'],
  ] as const
).map(([type, name, field]) => ({
  type,
  name,
  dayField: `${field}_day`,
  dateField: `${field}_start`,
  weeksField: `${field}_weeks`,
}));

/**
 * A zone's field. Councils vary the standard's names slightly (`Rub_start`, `rub_week`), as
 * the maps that read these files allow for.
 */
function read(zone: Record<string, unknown>, field = ''): unknown {
  return zone[field] ?? zone[field.charAt(0).toUpperCase() + field.slice(1)];
}

/** A zone's date: a timestamp (milliseconds, midnight UTC), `YYYY/MM/DD`, or any usual text. */
function zoneDate(value: unknown): LocalDate | undefined {
  if (typeof value === 'number') return toLocalDate(new Date(value).toISOString().slice(0, 10));
  return parseAustralianDate(
    String(value ?? '').replace(/^\s*(\d{4})\/(\d\d)\/(\d\d)/, '$1-$2-$3'),
  );
}

/** One of the bin's collection dates, from whichever of the ways its config names. */
function anchorOf(
  bin: ZoneBin,
  zone: Record<string, unknown>,
  today: LocalDate,
  weekField?: string,
): LocalDate | undefined {
  const day = String(read(zone, bin.dayField) ?? '');
  if (bin.dateField) {
    const date = zoneDate(read(zone, bin.dateField));
    return (date && weekdayInWeekOf(day, date)) ?? date;
  }
  if (!bin.weekOf) return nextWeekday(day, today);
  const week =
    typeof bin.weekOf === 'string' ? bin.weekOf : bin.weekOf[String(zone[weekField ?? ''])];
  return week ? weekdayInWeekOf(day, toLocalDate(week)) : undefined;
}

/** The bins a zone's fields describe. A bin the zone has no date or day for is left out. */
export function zoneServices(
  bins: ZoneBin[],
  zone: Record<string, unknown>,
  today: LocalDate,
  weekField?: string,
): BinService[] {
  const services: BinService[] = [];
  for (const bin of bins) {
    const anchor = anchorOf(bin, zone, today, weekField);
    if (!anchor) continue;
    const weeks = Number(
      read(zone, bin.weeksField) ?? read(zone, bin.weeksField?.replace(/s$/, '')),
    );
    services.push(binService(bin.type, bin.name, anchor, weeks ? weeks * 7 : bin.everyDays));
  }
  return services;
}
