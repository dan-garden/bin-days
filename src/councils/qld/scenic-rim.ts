import { pickAddress, searchLine } from '../../core/address.js';
import { nextWeekday, toLocalDate, weekdayInWeekOf } from '../../core/date.js';
import { parseError } from '../../core/errors.js';
import { getText } from '../../core/http.js';
import { binService } from '../../core/schedule.js';
import type { CouncilAdapter } from '../types.js';

/**
 * Scenic Rim Regional Council, from the file of every property that its bin
 * lookup page reads: each one's bin day and its recycling week (red or blue).
 */
const FILE =
  'https://srrcwastebinserviceday.blob.core.windows.net/wastebinservicedayexport/WasteBinServiceDay_SRRCWebsiteSearch.csv';

/**
 * A Monday in each colour's week. The page's script counts from 1 August 2022, a blue week;
 * red weeks are the ones between.
 */
const RECYCLING_WEEK: Record<string, string> = { blue: '2022-08-01', red: '2022-08-08' };

export const scenicRim: CouncilAdapter = {
  id: 'qld/scenic-rim',
  name: 'Scenic Rim Regional Council',
  state: 'QLD',
  lgaCodes: ['36510'],
  timezone: 'Australia/Brisbane',
  website: 'https://www.scenicrim.qld.gov.au',
  platform: 'council-api',
  async getSchedule(address, { http, today }) {
    const line = `${searchLine(address, this.name, { includeUnit: true }).toLowerCase()} `;
    // shortcut: the whole file (about 1.5 MB) is read for each lookup, and lookups are cached
    // for the day; keep the parsed file in memory if this council gets busy.
    const rows = (await getText(http, FILE))
      .split(/\r?\n/)
      .filter((row) => row.toLowerCase().startsWith(line))
      // "12 Example Street BEAUDESERT  QLD 4285,Example Street,BEAUDESERT,Thursday,Week2 Blue"
      .map((row) => row.split(','));
    const [found = '', , , day = '', week = ''] = pickAddress(
      rows,
      ([street = '']) => street,
      address,
      this.name,
    );
    const weekly = nextWeekday(day, today);
    if (!weekly) throw parseError(`No bin services found for ${found}`, { url: FILE });

    const services = [binService('general', 'General waste', weekly, 7)];
    // A few properties say "Contact Council" in place of a recycling week.
    const anchor = RECYCLING_WEEK[week.split(' ').pop()?.toLowerCase() ?? ''];
    const recycling = anchor && weekdayInWeekOf(day, toLocalDate(anchor));
    if (recycling) services.push(binService('recycling', 'Recycling', recycling, 14));
    return { matchedAddress: found.replace(/\s+/g, ' '), services, sourceUrl: FILE };
  },
};
