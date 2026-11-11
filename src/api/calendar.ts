import { createHash } from 'node:crypto';
import { addDays } from '../core/date.js';
import type { LocalDate } from '../core/types.js';
import type { BinDaysResult } from '../service.js';

/**
 * A lookup's collection days as an iCalendar feed (RFC 5545): one all-day
 * event per day, named after its bins. Calendar apps that subscribe to the
 * feed's address fetch it again every so often, so it stays current by itself.
 */
export interface CalendarOptions {
  /** The site's address, linked from each event. */
  origin: string;
  /** Hour of the evening before (0 to 23) to remind at. No reminder if not given. */
  reminderHour?: number | undefined;
}

const ESTIMATED = 'Estimated from the regular cycle. Public holidays can shift it.';

/** Text as iCalendar wants it: its punctuation escaped. */
const escapeText = (text: string) =>
  text.replace(/[;,]/g, (c) => `\\${c}`).replace(/\r?\n/g, '\\n');

/** Lines may be at most 75 bytes; longer ones continue on a line starting with a space. */
function fold(line: string): string {
  const parts: string[] = [];
  let part = '';
  for (const char of line) {
    if (Buffer.byteLength(part + char) > (parts.length ? 74 : 75)) {
      parts.push(part);
      part = '';
    }
    part += char;
  }
  return [...parts, part].join('\r\n ');
}

const day = (date: LocalDate) => date.replaceAll('-', '');

export function toCalendar(result: BinDaysResult, options: CalendarOptions): string {
  const { address, days, today } = result;
  // Events keep the same id from one fetch to the next, so a calendar updates them in place.
  const property = createHash('sha1').update(address.matched).digest('hex').slice(0, 12);
  const host = new URL(options.origin).host;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//Bin Days//${host}//EN`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(`Bin days: ${address.matched}`)}`,
    `X-WR-TIMEZONE:${result.timezone}`,
    // Ask subscribed calendars to check back daily (each app has its own name for this).
    'REFRESH-INTERVAL;VALUE=DURATION:P1D',
    'X-PUBLISHED-TTL:P1D',
  ];
  for (const { date, bins } of days) {
    const estimated = bins.some((bin) => bin.confidence === 'projected');
    lines.push(
      'BEGIN:VEVENT',
      `UID:${date}-${property}@${host}`,
      `DTSTAMP:${day(today)}T000000Z`,
      `DTSTART;VALUE=DATE:${day(date)}`,
      `DTEND;VALUE=DATE:${day(addDays(date, 1))}`,
      `SUMMARY:${escapeText(`Bins: ${bins.map((bin) => bin.name).join(', ')}`)}`,
      `DESCRIPTION:${escapeText(
        [`${address.matched} (${result.council.name})`, estimated && ESTIMATED, options.origin]
          .filter(Boolean)
          .join('\n'),
      )}`,
      // An all-day note, not time that is taken up.
      'TRANSP:TRANSPARENT',
    );
    if (options.reminderHour != null) {
      lines.push(
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        `DESCRIPTION:${escapeText(`Bins out tonight: ${bins.map((bin) => bin.name).join(', ')}`)}`,
        // Counted back from the start of the collection day, so 6 pm is six hours before.
        `TRIGGER:-PT${24 - options.reminderHour}H`,
        'END:VALARM',
      );
    }
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return `${lines.map(fold).join('\r\n')}\r\n`;
}
