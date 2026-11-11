import { formatStreetLine, pickAddress } from '../../core/address.js';
import { nextWeekday, parseAustralianDate } from '../../core/date.js';
import { invalidInput, parseError } from '../../core/errors.js';
import { getJson } from '../../core/http.js';
import { binService } from '../../core/schedule.js';
import type { BinService } from '../../core/types.js';
import type { CouncilAdapter } from '../types.js';

/**
 * Whitehorse City Council, via the two calls behind its bin day map: one finds
 * the property, the other returns the collection area at that spot.
 */
const API = 'https://map.whitehorse.vic.gov.au/weave/services/v1';

interface Property {
  /** "12 Example Street NUNAWADING" */
  display1: string;
  centroid: { x: number; y: number };
}

/** The area's weekday, and the next dates of the two fortnightly bins ("23 Nov 2026"). */
interface Area {
  collectionDay?: string;
  nextRecycle?: string;
  nextGOBS?: string;
}

export const whitehorse: CouncilAdapter = {
  id: 'vic/whitehorse',
  name: 'Whitehorse City Council',
  state: 'VIC',
  lgaCodes: ['26980'],
  timezone: 'Australia/Melbourne',
  website: 'https://www.whitehorse.vic.gov.au',
  platform: 'council-api',
  async getSchedule(address, { http, today }) {
    const { parts } = address;
    if (!parts.houseNumber || !parts.street) {
      throw invalidInput('Whitehorse lookups need a house number and street', { parts });
    }
    const search = `${API}/index/search?${new URLSearchParams({
      start: '0',
      limit: '10',
      indexes: 'index.property',
      type: 'EXACT',
      crs: 'EPSG:4326',
      highlight: 'false',
      query: [formatStreetLine(parts, { includeUnit: true }), parts.suburb].join(' ').trim(),
    })}`;
    const { results } = await getJson<{ results?: Property[] }>(http, search);
    const property = pickAddress(results ?? [], (r) => r.display1, address, this.name);

    const { x, y } = property.centroid;
    const url = `${API}/feature/getFeatures?${new URLSearchParams({
      shape: `POINT(${x} ${y})`,
      entityId: 'lyr_waste',
      datadefinition: 'dd_whm_waste',
      inCrs: 'EPSG:4326',
      outCrs: 'EPSG:4326',
      operation: 'intersects',
      returnCentroid: 'true',
      returnFirst: 'true',
    })}`;
    const found = await getJson<{
      features?: Array<{ properties?: { dd_whm_waste?: Area[] } }>;
    }>(http, url);
    const area = found.features?.[0]?.properties?.dd_whm_waste?.[0];

    // Household waste goes every week on the area's day; the map words the other two as fortnightly.
    const services: BinService[] = [];
    const weekly = nextWeekday(area?.collectionDay ?? '', today);
    if (weekly) services.push(binService('general', 'Household waste', weekly, 7));
    const recycling = parseAustralianDate(area?.nextRecycle ?? '');
    if (recycling) services.push(binService('recycling', 'Recycling', recycling, 14));
    const organics = parseAustralianDate(area?.nextGOBS ?? '');
    if (organics) services.push(binService('organics', 'Food and garden organics', organics, 14));
    if (!services.length) {
      throw parseError(`No bin services found for ${property.display1}`, { url });
    }
    return { matchedAddress: property.display1, services, sourceUrl: url };
  },
};
