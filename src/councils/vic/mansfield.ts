import * as cheerio from 'cheerio';
import { pickAddress, searchLine } from '../../core/address.js';
import { parseAustralianDate } from '../../core/date.js';
import { parseError } from '../../core/errors.js';
import { getJson, getText } from '../../core/http.js';
import { binService } from '../../core/schedule.js';
import type { BinService, LocalDate } from '../../core/types.js';
import type { CouncilAdapter } from '../types.js';

/**
 * Mansfield Shire Council, via its "check my bin day" page: one call suggests
 * addresses, and the page itself, asked for one, shows each bin's next date.
 */
const SITE = 'https://www.mansfield.vic.gov.au';

/** Where each bin's date is on the page, and its cycle as the council's waste pages give it. */
const BINS = [
  { block: '.general_waste_api_alias', type: 'general', name: 'General waste', everyDays: 7 },
  { block: '.recycling_api_alias', type: 'recycling', name: 'Recycling', everyDays: 14 },
  { block: '.green_bin_api_alias', type: 'organics', name: 'Green bin', everyDays: 14 },
] as const;

/** Each bin's next date, the last line of its block ("Fri 13/11/2026"). Exported for tests. */
export function parseBins(html: string): BinService[] {
  const $ = cheerio.load(html);
  const services: BinService[] = [];
  for (const bin of BINS) {
    const date: LocalDate | undefined = parseAustralianDate($(`${bin.block} p`).last().text());
    if (date) services.push(binService(bin.type, bin.name, date, bin.everyDays));
  }
  return services;
}

export const mansfield: CouncilAdapter = {
  id: 'vic/mansfield',
  name: 'Mansfield Shire Council',
  state: 'VIC',
  lgaCodes: ['24250'],
  timezone: 'Australia/Melbourne',
  website: 'https://www.mansfield.vic.gov.au',
  platform: 'council-api',
  async getSchedule(address, { http }) {
    const search = `${SITE}/views-autocomplete-filters/waste_schedule/block_1/formatted_address/0?${new URLSearchParams(
      { q: searchLine(address, this.name, { includeUnit: true }) },
    )}`;
    const results = await getJson<Array<{ value: string }>>(http, search);
    // "12 Example Street MANSFIELD  VIC  3722"
    const property = pickAddress(results, (r) => r.value, address, this.name).value;

    const url = `${SITE}/waste-schedule?${new URLSearchParams({ formatted_address: property })}`;
    const services = parseBins(await getText(http, url));
    if (!services.length) throw parseError(`No bin services found for ${property}`, { url });
    return { matchedAddress: property.replace(/\s+/g, ' '), services, sourceUrl: url };
  },
};
