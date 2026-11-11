import { pickAddress, searchLine } from '../../core/address.js';
import { parseAustralianDate } from '../../core/date.js';
import { parseError } from '../../core/errors.js';
import { binService, parseFrequency } from '../../core/schedule.js';
import type { BinService } from '../../core/types.js';
import { queryPoziLayer } from '../../platforms/pozi.js';
import type { CouncilAdapter } from '../types.js';

/**
 * City of Vincent, from the properties on its waste map. Each one carries
 * every bin's next date and cycle, worded for display.
 */
const BINS = [
  { field: 'General Waste Collection Day', type: 'general', name: 'General waste' },
  { field: 'Recycling Collection Day', type: 'recycling', name: 'Recycling' },
  { field: 'FOGO Collection Day', type: 'organics', name: 'Food and garden organics' },
] as const;

export const vincent: CouncilAdapter = {
  id: 'wa/vincent',
  name: 'City of Vincent',
  state: 'WA',
  lgaCodes: ['58570'],
  timezone: 'Australia/Perth',
  website: 'https://www.vincent.wa.gov.au',
  platform: 'pozi',
  async getSchedule(address, { http }) {
    // The map writes addresses as "12 Example St, Leederville".
    const line = searchLine(address, this.name, { abbreviate: true }).replace(/'/g, "''");
    const { features, url } = await queryPoziLayer(http, 'vincent', 'waste', 'Waste_Collection', {
      EXP_FILTER: `"Address" ILIKE '${line}%'`,
    });
    // A property can be listed more than once; the entry with bins is the one wanted.
    const withBins = features.filter((feature) => feature[BINS[0].field]);
    const property = pickAddress(
      withBins.length ? withBins : features,
      (feature) => String(feature.Address ?? ''),
      address,
      this.name,
    );
    const services: BinService[] = [];
    for (const bin of BINS) {
      // "<p>General Waste Collection Day:</p><p>16 Nov 2026 - Fortnightly (Monday Week 1)</p>"
      const text = String(property[bin.field] ?? '').replace(/<[^>]+>/g, ' ');
      const date = parseAustralianDate(text);
      if (date) services.push(binService(bin.type, bin.name, date, parseFrequency(text)));
    }
    const matchedAddress = String(property.Address);
    if (!services.length) throw parseError(`No bin services found for ${matchedAddress}`, { url });
    return { matchedAddress, services, sourceUrl: url };
  },
};
