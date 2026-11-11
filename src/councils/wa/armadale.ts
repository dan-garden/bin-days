import { pickAddress, searchLine } from '../../core/address.js';
import { addDays, nextWeekday, weekdayInWeekOf } from '../../core/date.js';
import { parseError } from '../../core/errors.js';
import { getJson } from '../../core/http.js';
import { binService } from '../../core/schedule.js';
import type { CouncilAdapter } from '../types.js';

/**
 * City of Armadale, via the call behind its "my waste collection day" page. It
 * gives the bin day, and whether recycling goes this week or next. Rubbish is
 * collected every week and recycling every second week, on the same day.
 */
const API = 'https://api.my.armadale.wa.gov.au/bins';

interface Property {
  /** "12 Example Avenue, ARMADALE" */
  address: string;
  bin_day?: string;
  /** "This Week (Area 2)" or "Next Week (Area 1)" */
  recycle_area?: string;
}

export const armadale: CouncilAdapter = {
  id: 'wa/armadale',
  name: 'City of Armadale',
  state: 'WA',
  lgaCodes: ['50210'],
  timezone: 'Australia/Perth',
  website: 'https://my.armadale.wa.gov.au',
  platform: 'council-api',
  async getSchedule(address, { http, today }) {
    const url = `${API}?${new URLSearchParams({
      address: searchLine(address, this.name, { includeUnit: true }),
    })}`;
    const results = await getJson<Property[]>(http, url);
    const property = pickAddress(results, (r) => r.address, address, this.name);

    const day = property.bin_day ?? '';
    const weekly = nextWeekday(day, today);
    // shortcut: "this week" is read as Monday to Sunday; if the council's week turns over on
    // a Sunday, a lookup made on a Sunday is a week out. Check against its calendar to settle it.
    const thisWeek = weekdayInWeekOf(day, today);
    if (!weekly || !thisWeek) {
      throw parseError(`No bin services found for ${property.address}`, { url });
    }
    const services = [binService('general', 'Rubbish', weekly, 7)];
    const [, when] = /^(This|Next) Week/i.exec(property.recycle_area ?? '') ?? [];
    if (when) {
      const recycling = addDays(thisWeek, when.toLowerCase() === 'next' ? 7 : 0);
      services.push(binService('recycling', 'Recycling', recycling, 14));
    }
    return { matchedAddress: property.address, services, sourceUrl: url };
  },
};
