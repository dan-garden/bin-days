import { pickAddress, searchLine } from '../../core/address.js';
import { isLocalDate } from '../../core/date.js';
import { parseError } from '../../core/errors.js';
import { getJson, getText } from '../../core/http.js';
import { binService } from '../../core/schedule.js';
import type { BinService, BinType } from '../../core/types.js';
import type { CouncilAdapter } from '../types.js';

/**
 * Mosman Council, via the two calls behind its collection dates page: one finds
 * the property, the other returns each collection's next date.
 */
const API = 'https://apps.mosman.nsw.gov.au';

/**
 * The collections in the answer. It doesn't say how often each goes; the council collects
 * general waste every week, so only that one is given a cycle.
 */
const BINS: Record<string, { type: BinType; name: string; everyDays?: number }> = {
  generalWaste: { type: 'general', name: 'General waste', everyDays: 7 },
  containersGlass: { type: 'recycling', name: 'Containers and glass' },
  paperCardboard: { type: 'recycling', name: 'Paper and cardboard' },
  vegetation: { type: 'organics', name: 'Vegetation' },
  generalCleanUp: { type: 'bulky', name: 'General clean-up' },
};

export const mosman: CouncilAdapter = {
  id: 'nsw/mosman',
  name: 'Mosman Council',
  state: 'NSW',
  lgaCodes: ['15350'],
  timezone: 'Australia/Sydney',
  website: 'https://mosman.nsw.gov.au',
  platform: 'council-api',
  async getSchedule(address, { http }) {
    const search = `${API}/?${new URLSearchParams({
      rah_external_output: 'website',
      a: searchLine(address, this.name),
    })}`;
    // Suggestions come as XML: <item><address>4/12 Example Road</address>...</item>
    const results = [...(await getText(http, search)).matchAll(/<address>([^<]+)<\/address>/g)];
    const property = pickAddress(
      results.map(([, line = '']) => line),
      (line) => line,
      address,
      this.name,
    );

    const url = `${API}/test`;
    const answer = await getJson<Array<{ calendarDate?: string; type?: string }>>(http, url, {
      method: 'POST',
      body: new URLSearchParams({ address: property }),
    });
    const services: BinService[] = [];
    for (const { calendarDate = '', type = '' } of Array.isArray(answer) ? answer : []) {
      const bin = BINS[type];
      const date = calendarDate.slice(0, 10);
      if (bin && isLocalDate(date))
        services.push(binService(bin.type, bin.name, date, bin.everyDays));
    }
    if (!services.length) throw parseError(`No bin services found for ${property}`, { url });
    return { matchedAddress: `${property}, Mosman`, services, sourceUrl: url };
  },
};
