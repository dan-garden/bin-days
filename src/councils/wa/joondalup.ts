import { formatStreetLine, preferSuburb } from '../../core/address.js';
import { isLocalDate, nextWeekday } from '../../core/date.js';
import { addressNotFound, invalidInput, parseError } from '../../core/errors.js';
import { getJson } from '../../core/http.js';
import type { BinService } from '../../core/types.js';
import type { CouncilAdapter } from '../types.js';

/**
 * City of Joondalup, via the two calls behind the council's bin collection
 * page: one finds the property, the other returns its rubbish day, its next
 * recycling date and its next bulk rubbish pick-up.
 */
const API = 'https://www.joondalup.wa.gov.au/aapi/coj';

interface Property {
  formatted_address: string;
  house_no: number | null;
  unit_no: string | number | null;
  street: string;
  locality: string;
  mapkey: string;
}

interface BinDates {
  /** A weekday; rubbish is collected weekly. */
  Rubbish_Day?: string | null;
  Next_Recycling_Date_CustomValue?: string | null;
  Bulk_Rubbish_Pick_Up_CustomValue?: string | null;
}

export const joondalup: CouncilAdapter = {
  id: 'wa/joondalup',
  name: 'City of Joondalup',
  state: 'WA',
  lgaCodes: ['54170'],
  timezone: 'Australia/Perth',
  website:
    'https://www.joondalup.wa.gov.au/residents/waste-and-recycling/residential-bin-collections',
  platform: 'council-api',

  async getSchedule(address, { http, today }) {
    const { parts } = address;
    if (!parts.houseNumber || !parts.street) {
      throw invalidInput('Joondalup lookups need a house number and street', { parts });
    }
    const searchUrl = `${API}/propertylookup/${encodeURIComponent(formatStreetLine(parts))}`;
    const properties = await getJson<Property[]>(http, searchUrl);
    if (!Array.isArray(properties)) {
      throw parseError('Unexpected response from joondalup.wa.gov.au', { url: searchUrl });
    }

    const same = (a: unknown, b = '') => String(a ?? '').toLowerCase() === b.toLowerCase();
    const candidates = preferSuburb(
      properties.filter(
        (p) =>
          same(p.house_no, parts.houseNumber) &&
          same(p.street, parts.street) &&
          same(p.unit_no, parts.unit),
      ),
      (p) => p.locality,
      parts.suburb,
    );
    const property = candidates[0];
    if (!property || new Set(candidates.map((p) => p.mapkey)).size !== 1) {
      throw addressNotFound(`City of Joondalup has no property matching "${address.input}"`, {
        suggestions: (candidates.length ? candidates : properties)
          .slice(0, 5)
          .map((p) => p.formatted_address),
      });
    }

    const url = `${API}/bindatelookup/${encodeURIComponent(property.mapkey)}`;
    const [dates] = await getJson<BinDates[]>(http, url);
    if (!dates)
      throw parseError(`No bin services found for ${property.formatted_address}`, { url });

    const services: BinService[] = [];
    const rubbish = nextWeekday(dates.Rubbish_Day ?? '', today);
    if (rubbish) {
      services.push({
        type: 'general',
        name: 'General waste',
        colour: 'red',
        recurrence: { kind: 'interval', everyDays: 7, anchor: rubbish },
      });
    }
    const recycling = (dates.Next_Recycling_Date_CustomValue ?? '').slice(0, 10);
    if (isLocalDate(recycling)) {
      services.push({
        type: 'recycling',
        name: 'Recycling',
        colour: 'yellow',
        recurrence: { kind: 'interval', everyDays: 14, anchor: recycling },
      });
    }
    const bulk = (dates.Bulk_Rubbish_Pick_Up_CustomValue ?? '').slice(0, 10);
    if (isLocalDate(bulk)) {
      services.push({
        type: 'bulky',
        name: 'Bulk rubbish',
        recurrence: { kind: 'dates', dates: [bulk] },
      });
    }
    return { matchedAddress: property.formatted_address, services, sourceUrl: url };
  },
};
