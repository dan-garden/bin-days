import { formatStreetLine, preferSuburb } from '../../core/address.js';
import { addDays, nextWeekday, toLocalDate, weekdayInWeekOf } from '../../core/date.js';
import { addressNotFound, invalidInput, parseError } from '../../core/errors.js';
import { getJson } from '../../core/http.js';
import { binService } from '../../core/schedule.js';
import type { CouncilAdapter } from '../types.js';

/**
 * Sunshine Coast Council, via the street search behind the council's bin
 * collection days page. It works on streets, not houses: a street has a
 * weekday and a week (1 or 2).
 *
 * The weeks are counted the way the council's own page counts them, in
 * fortnights from the week of Monday 13 December 2021 (a week 1). General
 * waste goes out every week, recycling in the street's own week and garden
 * waste in the other.
 */
const API = 'https://www.sunshinecoast.qld.gov.au/__server__/api/v1/streets';
const WEEK_1 = toLocalDate('2021-12-13');

interface Street {
  /** With its type shortened, e.g. "Bulcock St". */
  street: string;
  locality: string;
  day: string;
  week: string;
}

export const sunshineCoast: CouncilAdapter = {
  id: 'qld/sunshine-coast',
  name: 'Sunshine Coast Council',
  state: 'QLD',
  lgaCodes: ['36720'],
  timezone: 'Australia/Brisbane',
  website:
    'https://www.sunshinecoast.qld.gov.au/living-and-community/waste-and-recycling/bin-collection-days',
  platform: 'council-api',

  async getSchedule(address, { http, today }) {
    const { parts } = address;
    const name = parts.streetName ?? parts.street;
    if (!name) throw invalidInput('Sunshine Coast lookups need a street', { parts });
    const url = `${API}/${encodeURIComponent(name)}`;
    const streets = await getJson<Street[]>(http, url);
    if (!Array.isArray(streets)) {
      throw parseError('Unexpected response from sunshinecoast.qld.gov.au', { url });
    }

    const wanted = [true, false].map((abbreviate) =>
      formatStreetLine({ ...parts, houseNumber: '' }, { abbreviate }).toLowerCase(),
    );
    const candidates = preferSuburb(
      streets.filter((street) => wanted.includes(street.street.toLowerCase())),
      (street) => street.locality,
      parts.suburb,
    );
    const street = candidates[0];
    // The same street can run through two suburbs; that only matters if their days differ.
    if (!street || new Set(candidates.map((s) => `${s.day} ${s.week}`)).size !== 1) {
      throw addressNotFound(`Sunshine Coast Council has no street matching "${address.input}"`, {
        suggestions: (candidates.length ? candidates : streets)
          .slice(0, 5)
          .map((s) => `${s.street}, ${s.locality}`),
      });
    }

    const weekly = nextWeekday(street.day, today);
    const own = weekdayInWeekOf(street.day, addDays(WEEK_1, street.week === '2' ? 7 : 0));
    if (!weekly || !own) throw parseError(`No collection day listed for ${street.street}`, { url });
    return {
      matchedAddress: `${street.street}, ${street.locality}`,
      services: [
        binService('general', 'General waste', weekly, 7),
        binService('recycling', 'Recycling', own, 14),
        binService('organics', 'Garden waste', addDays(own, 7), 14),
      ],
      sourceUrl: url,
    };
  },
};
