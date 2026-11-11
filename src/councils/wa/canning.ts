import { pickAddress, searchLine } from '../../core/address.js';
import { toLocalDate } from '../../core/date.js';
import { parseError } from '../../core/errors.js';
import { getJson } from '../../core/http.js';
import { binService } from '../../core/schedule.js';
import type { BinService } from '../../core/types.js';
import type { CouncilAdapter } from '../types.js';

/**
 * City of Canning, via the two calls behind its bin days page: one finds the
 * property, the other returns each bin's next date. The answer doesn't say how
 * often a bin goes, so only that one date is given.
 */
const API = 'https://www.canning.wa.gov.au/api/property-details';

interface Property {
  key: string;
  /** "12 Example Street CANNINGTON  6107" */
  address: string;
}

const BINS = [
  { field: 'rubbishCollectionDate', type: 'general', name: 'Rubbish' },
  { field: 'recyclingCollectionDate', type: 'recycling', name: 'Recycling' },
] as const;

/** Dates come as the moment the day starts in Perth, written in UTC: the evening before. */
const perthDate = (instant: string) =>
  toLocalDate(new Date(Date.parse(instant) + 8 * 3_600_000).toISOString().slice(0, 10));

export const canning: CouncilAdapter = {
  id: 'wa/canning',
  name: 'City of Canning',
  state: 'WA',
  lgaCodes: ['51330'],
  timezone: 'Australia/Perth',
  website: 'https://www.canning.wa.gov.au',
  platform: 'council-api',
  async getSchedule(address, { http }) {
    const line = searchLine(address, this.name, { includeUnit: true });
    const response = await http.fetch(`${API}/find/${encodeURIComponent(line)}`);
    // No match is an empty answer rather than an empty list.
    const results: Property[] =
      response.status === 200 ? ((await response.json()) as Property[]) : [];
    const property = pickAddress(results, (r) => r.address, address, this.name);

    const url = `${API}/bins/${encodeURIComponent(property.key)}`;
    const answer = await getJson<Record<string, string | null>>(http, url);
    const services: BinService[] = [];
    for (const bin of BINS) {
      const instant = answer[bin.field];
      if (instant) services.push(binService(bin.type, bin.name, perthDate(instant)));
    }
    if (!services.length)
      throw parseError(`No bin services found for ${property.address}`, { url });
    return { matchedAddress: property.address, services, sourceUrl: url };
  },
};
