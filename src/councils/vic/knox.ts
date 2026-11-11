import { formatStreetLine, pickAddress } from '../../core/address.js';
import { parseAustralianDate } from '../../core/date.js';
import { invalidInput, parseError } from '../../core/errors.js';
import { getJson } from '../../core/http.js';
import { binService } from '../../core/schedule.js';
import type { BinService, BinType } from '../../core/types.js';
import type { CouncilAdapter } from '../types.js';

/**
 * Knox City Council, via the two calls behind its "find my bin day" page: one
 * finds the property, the other returns each bin's next date.
 */
const API = 'https://www.knox.vic.gov.au/rubbish-collection';

/** Each bin's field in the answer, and its cycle as the page words it. */
const BINS: Array<{ field: string; type: BinType; name: string; everyDays: number }> = [
  { field: 'rubbish_date', type: 'general', name: 'Rubbish', everyDays: 14 },
  { field: 'recycling_date', type: 'recycling', name: 'Recycling', everyDays: 14 },
  { field: 'green_date', type: 'organics', name: 'Food and garden', everyDays: 7 },
];

export const knox: CouncilAdapter = {
  id: 'vic/knox',
  name: 'Knox City Council',
  state: 'VIC',
  lgaCodes: ['23670'],
  timezone: 'Australia/Melbourne',
  website: 'https://www.knox.vic.gov.au',
  platform: 'council-api',
  async getSchedule(address, { http }) {
    const { parts } = address;
    if (!parts.houseNumber || !parts.street) {
      throw invalidInput('Knox lookups need a house number and street', { parts });
    }
    const search = `${API}/autocomplete/find?${new URLSearchParams({
      q: formatStreetLine(parts, { includeUnit: true }),
    })}`;
    const results = await getJson<Array<{ value: string; label: string }>>(http, search);
    if (!Array.isArray(results)) {
      throw parseError('Unexpected response from knox.vic.gov.au', { url: search });
    }
    const property = pickAddress(results, (r) => r.label, address, this.name);

    const url = `${API}/find?${new URLSearchParams({ address: property.value })}`;
    const answer = await getJson<Record<string, string>>(http, url);
    const services: BinService[] = [];
    for (const bin of BINS) {
      // "Next collection is <span>18 November 2026</span>"
      const date = parseAustralianDate(answer[bin.field] ?? '');
      if (date) services.push(binService(bin.type, bin.name, date, bin.everyDays));
    }
    if (!services.length) throw parseError(`No bin services found for ${property.label}`, { url });
    return { matchedAddress: property.label, services, sourceUrl: url };
  },
};
