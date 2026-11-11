import { pickAddress, searchLine } from '../../core/address.js';
import { nextWeekday, parseAustralianDate } from '../../core/date.js';
import { parseError } from '../../core/errors.js';
import { getText, type HttpClient } from '../../core/http.js';
import { binService } from '../../core/schedule.js';
import type { BinService } from '../../core/types.js';
import type { CouncilAdapter } from '../types.js';

/**
 * City of Cockburn, via the two calls behind its bin collection map: one finds
 * the property, the other returns its bin day and its next garden waste date.
 */
const API = 'https://gis1.cockburn.wa.gov.au/webapiv2';

interface Property {
  /** "12 Example Crescent Spearwood WA 6163" */
  name: string;
  dbkey: string;
}

interface Details {
  Address: string;
  BinDay?: string;
  /** "Thursday Fortnightly (19-Nov-2026) (if applicable)" */
  GardenWaste?: string | null;
}

/** The service only answers in JSONP: the data wrapped in a call to the named function. */
async function getJsonp<T>(http: HttpClient, path: string, query: Record<string, string>) {
  const url = `${API}/${path}?${new URLSearchParams({ callback: 'cb', ...query })}`;
  const text = await getText(http, url);
  try {
    return {
      url,
      data: JSON.parse(text.slice(text.indexOf('cb(') + 3, text.lastIndexOf(')'))) as T,
    };
  } catch {
    throw parseError('Unexpected response from gis1.cockburn.wa.gov.au', { url });
  }
}

export const cockburn: CouncilAdapter = {
  id: 'wa/cockburn',
  name: 'City of Cockburn',
  state: 'WA',
  lgaCodes: ['51820'],
  timezone: 'Australia/Perth',
  website: 'https://www.cockburn.wa.gov.au',
  platform: 'council-api',
  async getSchedule(address, { http, today }) {
    const { data: results } = await getJsonp<Property[]>(http, 'FuzzySearch/', {
      app: 'mapcontrol',
      q: searchLine(address, this.name, { includeUnit: true }),
      num: '20',
      theme: 'PROPERTY',
    });
    const property = pickAddress(results, (r) => r.name, address, this.name);

    const { url, data } = await getJsonp<Details[]>(http, 'PropertyInfoSearch/PropertyNo', {
      q: property.dbkey,
      search_method: 'property_no',
    });
    const [details] = data;
    // The council collects general waste and recycling every week, on the same day.
    const weekly = nextWeekday(details?.BinDay ?? '', today);
    if (!details || !weekly)
      throw parseError(`No bin services found for ${property.name}`, { url });
    const services: BinService[] = [
      binService('general', 'General waste', weekly, 7),
      binService('recycling', 'Recycling', weekly, 7),
    ];
    // Only some properties have a garden bin, and the answer can't say which.
    const garden = parseAustralianDate(details.GardenWaste ?? '');
    if (garden)
      services.push(binService('organics', 'Garden organics (if you have one)', garden, 14));
    return { matchedAddress: details.Address, services, sourceUrl: url };
  },
};
