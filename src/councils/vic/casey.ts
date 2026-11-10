import { formatStreetLine, matchesHouseNumber, preferSuburb } from '../../core/address.js';
import { DEFAULT_COLOURS } from '../../core/bin-types.js';
import { daysBetween, isLocalDate, parseAustralianDate } from '../../core/date.js';
import { addressNotFound, invalidInput, parseError } from '../../core/errors.js';
import { getJson } from '../../core/http.js';
import { parseFrequency } from '../../core/schedule.js';
import type { BinService, LocalDate } from '../../core/types.js';
import type { CouncilAdapter } from '../types.js';

/**
 * City of Casey, via the address search behind the council's "find your bin
 * collection day" page. One call returns each matching property with the
 * next date of every bin and a line saying how often it goes
 * ("Fortnightly on Monday;...").
 */
const SEARCH = 'https://www.casey.vic.gov.au/coc-properties/api/search-address';

type Property = { full_address: string } & Record<string, string | number | null>;

const BINS = [
  { type: 'general', name: 'Rubbish', date: 'NextGarbageDate', cycle: 'Rubbish' },
  { type: 'recycling', name: 'Recycling', date: 'NextRecycleDate', cycle: 'Recycling' },
  { type: 'organics', name: 'Garden waste', date: 'NextGardenDate', cycle: 'Garden' },
  { type: 'glass', name: 'Glass', date: 'NextGlassDate', cycle: 'Glass' },
] as const;

export const casey: CouncilAdapter = {
  id: 'vic/casey',
  name: 'City of Casey',
  state: 'VIC',
  lgaCodes: ['21610'],
  timezone: 'Australia/Melbourne',
  website: 'https://www.casey.vic.gov.au/find-your-bin-collection-day',
  platform: 'council-api',

  async getSchedule(address, { http }) {
    const { parts } = address;
    if (!parts.houseNumber || !parts.street) {
      throw invalidInput('Casey lookups need a house number and street', { parts });
    }
    const term = formatStreetLine(parts, { includeUnit: true });
    const url = `${SEARCH}?term=${encodeURIComponent(term)}&bin_collection_details=true`;
    const { result } = await getJson<{ result?: Property[] }>(http, url);
    if (!Array.isArray(result))
      throw parseError('Unexpected response from casey.vic.gov.au', { url });

    const suburb = (parts.suburb ?? '').toUpperCase();
    const candidates = preferSuburb(
      result.filter((p) => matchesHouseNumber(p.full_address, parts)),
      (p) => (suburb && p.full_address.toUpperCase().includes(` ${suburb} `) ? suburb : ''),
      suburb,
    );
    const property = candidates[0];
    if (!property || new Set(candidates.map((p) => p.full_address)).size !== 1) {
      throw addressNotFound(`City of Casey has no property matching "${address.input}"`, {
        suggestions: (candidates.length ? candidates : result)
          .slice(0, 5)
          .map((p) => p.full_address),
      });
    }

    const services: BinService[] = [];
    for (const bin of BINS) {
      const anchor = String(property[bin.date] ?? '');
      if (!isLocalDate(anchor)) continue;
      const everyDays = cycleDays(String(property[bin.cycle] ?? ''), anchor);
      const colour = DEFAULT_COLOURS[bin.type];
      services.push({
        type: bin.type,
        name: bin.name,
        ...(colour ? { colour } : {}),
        recurrence: everyDays
          ? { kind: 'interval', everyDays, anchor }
          : { kind: 'dates', dates: [anchor] },
      });
    }
    return { matchedAddress: property.full_address, services, sourceUrl: url };
  },
};

/**
 * How often a bin goes, from Casey's description of it, e.g. "Fortnightly on
 * Monday;Past: 2 November, 9 November;Next: 16 November, 23 November". The
 * gap between the upcoming dates is trusted over the word, because the two
 * sometimes disagree.
 */
function cycleDays(description: string, anchor: LocalDate): number | undefined {
  const upcoming = [...description.matchAll(/(\d{1,2}) ([A-Z][a-z]+)/g)]
    .map(([, day, month]) => parseAustralianDate(`${day} ${month} ${anchor.slice(0, 4)}`))
    .filter((date) => date != null && date >= anchor);
  const [first, second] = upcoming;
  return first && second && second > first
    ? daysBetween(first, second)
    : parseFrequency(description);
}
