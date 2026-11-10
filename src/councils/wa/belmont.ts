import { formatStreetLine, matchesHouseNumber, preferSuburb } from '../../core/address.js';
import { isLocalDate } from '../../core/date.js';
import { addressNotFound, invalidInput, parseError } from '../../core/errors.js';
import { getJson } from '../../core/http.js';
import { binService } from '../../core/schedule.js';
import type { BinService, BinType } from '../../core/types.js';
import type { CouncilAdapter } from '../types.js';

/**
 * City of Belmont, via the two calls behind the council's "my property" search:
 * one finds the property, the other returns each bin's next date.
 */
const API = 'https://www.belmont.wa.gov.au/api/intramaps';

interface Property {
  mapkey: number;
  dbkey: number;
  /** "12 Example Street Kewdale 6105" */
  Address: string;
}

/**
 * Each bin's next date in the answer. The answer doesn't say how often a bin
 * goes, so only that one date is given.
 */
const BINS: Array<{ date: string; type: BinType; name: string }> = [
  { date: 'BinDayGeneralWasteFormatted', type: 'general', name: 'General waste' },
  { date: 'BinDayRecyclingFormatted', type: 'recycling', name: 'Recycling' },
  { date: 'BinDayFOGOFormatted', type: 'organics', name: 'Food and garden organics' },
];

export const belmont: CouncilAdapter = {
  id: 'wa/belmont',
  name: 'City of Belmont',
  state: 'WA',
  lgaCodes: ['50490'],
  timezone: 'Australia/Perth',
  website: 'https://www.belmont.wa.gov.au',
  platform: 'council-api',

  async getSchedule(address, { http }) {
    const { parts } = address;
    if (!parts.houseNumber || !parts.street) {
      throw invalidInput('Belmont lookups need a house number and street', { parts });
    }
    const line = formatStreetLine(parts, { includeUnit: true });
    const searchUrl = `${API}/getaddresses?${new URLSearchParams({ key: line })}`;
    const properties = await getJson<Property[]>(http, searchUrl);
    if (!Array.isArray(properties)) {
      throw parseError('Unexpected response from belmont.wa.gov.au', { url: searchUrl });
    }

    const candidates = preferSuburb(
      properties.filter((p) => matchesHouseNumber(p.Address, parts)),
      // The suburb is whatever follows the street line and comes before the postcode.
      (p) =>
        p.Address.slice(line.length)
          .replace(/\d{4}$/, '')
          .trim(),
      parts.suburb,
    );
    const property = candidates[0];
    if (!property || candidates.length > 1) {
      throw addressNotFound(`City of Belmont has no property matching "${address.input}"`, {
        suggestions: (candidates.length ? candidates : properties)
          .slice(0, 5)
          .map((p) => p.Address),
      });
    }

    const url = `${API}/getpropertydetailswithlocalgov?${new URLSearchParams({
      mapkey: String(property.mapkey),
      dbkey: String(property.dbkey),
    })}`;
    const { data } = await getJson<{ data?: Record<string, unknown> }>(http, url);

    const services: BinService[] = [];
    for (const bin of BINS) {
      const date = String(data?.[bin.date] ?? '').slice(0, 10);
      // A bin the property doesn't have comes back as the year 1.
      if (isLocalDate(date) && date > '2000') services.push(binService(bin.type, bin.name, date));
    }
    if (!services.length)
      throw parseError(`No bin services found for ${property.Address}`, { url });
    return { matchedAddress: property.Address, services, sourceUrl: url };
  },
};
