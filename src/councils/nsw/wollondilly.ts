import { pickAddress, searchLine } from '../../core/address.js';
import { compareDates, parseAustralianDate } from '../../core/date.js';
import { parseError } from '../../core/errors.js';
import { getJson, type HttpClient } from '../../core/http.js';
import { binService } from '../../core/schedule.js';
import type { BinService } from '../../core/types.js';
import type { CouncilAdapter } from '../types.js';

/**
 * Wollondilly Shire Council, via the two calls behind its bin days page: one
 * finds the property, the other returns its next two collections.
 */
const API = 'https://yokqi4ofx1.execute-api.ap-southeast-2.amazonaws.com/Live';

/** Each answer is a list of records, each a list of named values. */
async function lookup(http: HttpClient, call: string, fields: string) {
  const url = `${API}/${call}?${new URLSearchParams({ fields })}`;
  const records = await getJson<Array<Array<{ name: string; value: string }>>>(http, url);
  if (!Array.isArray(records)) throw parseError('Unexpected response from Wollondilly', { url });
  return {
    url,
    records: records.map((record) => Object.fromEntries(record.map((f) => [f.name, f.value]))),
  };
}

export const wollondilly: CouncilAdapter = {
  id: 'nsw/wollondilly',
  name: 'Wollondilly Shire Council',
  state: 'NSW',
  lgaCodes: ['18400'],
  timezone: 'Australia/Sydney',
  website: 'https://www.wollondilly.nsw.gov.au',
  platform: 'council-api',
  async getSchedule(address, { http }) {
    const found = await lookup(http, 'wcc_address_lookup', searchLine(address, this.name));
    // "12 Example Street PICTON NSW"
    const property = pickAddress(found.records, (r) => r.PropertyAddress ?? '', address, this.name);
    const { url, records } = await lookup(http, 'wcc_details_lookup', property.ParcelNo ?? '');

    // "Monday, 16 November 2026, Garbage and Recycling", then the week after with garden organics.
    // Garbage goes every week, so on the earlier of the two; the other bins every second week.
    const recycling = parseAustralianDate(records[0]?.WasteNextPickupType1 ?? '');
    const organics = parseAustralianDate(records[0]?.WasteNextPickupType2 ?? '');
    const services: BinService[] = [];
    const [first] = [recycling, organics].filter((d) => d !== undefined).sort(compareDates);
    if (first) services.push(binService('general', 'Garbage', first, 7));
    if (recycling) services.push(binService('recycling', 'Recycling', recycling, 14));
    if (organics) services.push(binService('organics', 'Garden organics', organics, 14));
    const matchedAddress = property.PropertyAddress ?? address.input;
    if (!services.length) throw parseError(`No bin services found for ${matchedAddress}`, { url });
    return { matchedAddress, services, sourceUrl: url };
  },
};
