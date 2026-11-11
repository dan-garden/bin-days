import { pickAddress, searchLine } from '../../core/address.js';
import { classifyBin } from '../../core/bin-types.js';
import { daysBetween, parseAustralianDate } from '../../core/date.js';
import { parseError } from '../../core/errors.js';
import { getJson } from '../../core/http.js';
import { binService } from '../../core/schedule.js';
import type { BinService } from '../../core/types.js';
import type { CouncilAdapter } from '../types.js';

/**
 * Clarence City Council, via the two calls behind its collection days page: one
 * finds the property, the other returns each bin's next two dates.
 */
const API = 'https://www.ccc.tas.gov.au/wp-json/waste-collection';

const post = (body: object): RequestInit => ({
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
});

export const clarence: CouncilAdapter = {
  id: 'tas/clarence',
  name: 'Clarence City Council',
  state: 'TAS',
  lgaCodes: ['61410'],
  timezone: 'Australia/Hobart',
  website: 'https://www.ccc.tas.gov.au',
  platform: 'council-api',
  async getSchedule(address, { http }) {
    const line = searchLine(address, this.name, { includeUnit: true });
    const found = await getJson<{ results?: string[] }>(
      http,
      `${API}/address-search`,
      post({ address: line }),
    );
    // "12 Example Street ROSNY PARK  TAS  7018"
    const property = pickAddress(found.results ?? [], (r) => r, address, this.name);

    const url = `${API}/collection-search`;
    const answer = await getJson<{ results?: Array<{ name: string; value: string }> }>(
      http,
      url,
      post({ address: property }),
    );
    const services: BinService[] = [];
    for (const { name, value } of answer.results ?? []) {
      // "Garbage Pickup": "Fortnightly 11/11/2026, 25/11/2026". The gap between the two is the cycle.
      if (!name.endsWith(' Pickup')) continue;
      const [next, after] = (value.match(/\d+\/\d+\/\d{4}/g) ?? []).map(parseAustralianDate);
      if (!next) continue;
      const label = name.replace(' Pickup', '');
      const everyDays = after ? daysBetween(next, after) : undefined;
      services.push(binService(classifyBin(label), label, next, everyDays));
    }
    if (!services.length) throw parseError(`No bin services found for ${property}`, { url });
    return { matchedAddress: property.replace(/\s+/g, ' '), services, sourceUrl: url };
  },
};
