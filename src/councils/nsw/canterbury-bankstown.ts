import { formatStreetLine, preferSuburb } from '../../core/address.js';
import { nextWeekday, toLocalDate, weekdayInWeekOf } from '../../core/date.js';
import { addressNotFound, invalidInput, parseError, upstreamError } from '../../core/errors.js';
import { binService } from '../../core/schedule.js';
import type { BinService } from '../../core/types.js';
import type { CouncilAdapter } from '../types.js';

/**
 * City of Canterbury Bankstown, via the one file behind the council's Bin Day
 * Finder: every address with its weekdays, its area (A or B) and which of the
 * council's collection patterns it is on.
 *
 * The rules below are the Bin Day Finder's own. It counts fortnights from the
 * week of Monday 8 March 2021: area A's recycling goes out in those weeks and
 * its garden bin in the weeks between, and area B is the other way round.
 */
const DATA_URL = 'https://bindayfinder.azurewebsites.net/streetData.json.gz';
const FIRST_WEEK = toLocalDate('2021-03-08');
const SECOND_WEEK = toLocalDate('2021-03-15');

interface Row {
  /** "12 Example Avenue, Punchbowl 2196", or "3 / 12 Example Avenue, ..." for a unit. */
  fullAddress: string;
  /** "12 Example Avenue" */
  address: string;
  /** The collection pattern: 1, 2a, 2b, 2c, 3, 4, 5 or 6. */
  tab: string;
  redServiceDay: string | null;
  redServiceDay2: string | null;
  redServiceDay3: string | null;
  yellowServiceDay: string | null;
  greenServiceDay: string | null;
  /** A, B or Weekly. */
  zone: string;
  yellowZone: string | null;
}

/** A property's bins, by the Bin Day Finder's rules. Exported for tests. */
export function binsFor(row: Row, today: Parameters<typeof nextWeekday>[1]): BinService[] {
  const services: BinService[] = [];
  /** A bin on `day`: weekly, or fortnightly in area A's or B's weeks. */
  const add = (
    type: BinService['type'],
    name: string,
    day: string | null,
    cycle: string,
    weeks = { A: FIRST_WEEK, B: SECOND_WEEK },
  ) => {
    if (!day) return;
    const anchor =
      cycle === 'Weekly'
        ? nextWeekday(day, today)
        : weekdayInWeekOf(day, cycle === 'B' ? weeks.B : weeks.A);
    if (anchor) services.push(binService(type, name, anchor, cycle === 'Weekly' ? 7 : 14));
  };

  const redDays = [row.redServiceDay, row.redServiceDay2, row.redServiceDay3].filter(Boolean);
  for (const day of redDays) {
    add('general', redDays.length > 1 ? `General waste (${day})` : 'General waste', day, 'Weekly');
  }

  // Recycling: on its own day and area where the pattern has them, otherwise with the red bin.
  if (row.tab === '1') add('recycling', 'Recycling', row.redServiceDay, row.zone);
  else if (row.tab === '2b') add('recycling', 'Recycling', row.greenServiceDay, row.zone);
  else if (row.tab === '2c' || row.tab === '5') {
    add('recycling', 'Recycling', row.yellowServiceDay, row.yellowZone ?? 'Weekly');
  } else {
    for (const day of redDays.slice(0, 2)) {
      add('recycling', redDays.length > 1 ? `Recycling (${day})` : 'Recycling', day, 'Weekly');
    }
  }

  // Garden: always fortnightly, in the weeks area A's recycling doesn't go.
  const gardenDay = row.tab === '1' || row.tab === '3' ? row.redServiceDay : row.greenServiceDay;
  add('organics', 'Garden organics', gardenDay, row.zone === 'B' ? 'B' : 'A', {
    A: SECOND_WEEK,
    B: FIRST_WEEK,
  });
  return services;
}

export const canterburyBankstown: CouncilAdapter = {
  id: 'nsw/canterbury-bankstown',
  name: 'City of Canterbury Bankstown',
  state: 'NSW',
  lgaCodes: ['11570'],
  timezone: 'Australia/Sydney',
  website: 'https://www.cbcity.nsw.gov.au/residents/bin-collection-days',
  platform: 'council-api',

  async getSchedule(address, { http, today }) {
    const { parts } = address;
    if (!parts.houseNumber || !parts.street) {
      throw invalidInput('Canterbury Bankstown lookups need a house number and street', { parts });
    }
    const response = await http.fetch(DATA_URL);
    if (!response.ok || !response.body) {
      throw upstreamError(`bindayfinder.azurewebsites.net responded with HTTP ${response.status}`, {
        url: DATA_URL,
      });
    }
    // shortcut: the whole file (about 2 MB) is read for each lookup, and lookups are cached for
    // the day; keep it in memory if this council's traffic grows.
    const rows = (await new Response(
      response.body.pipeThrough(new DecompressionStream('gzip')),
    ).json()) as Row[];

    const line = formatStreetLine(parts).toLowerCase();
    const atAddress = rows.filter((row) => row.address.toLowerCase() === line);
    const unit = atAddress.filter((row) => row.fullAddress.startsWith(`${parts.unit} / `));
    const candidates = preferSuburb(
      unit.length ? unit : atAddress,
      (row) => row.fullAddress.replace(/^.*, | \d{4}$/g, ''),
      parts.suburb,
    );
    const row = candidates[0];
    // The units of one building share its bins; only differing answers make the address unclear.
    const bins = (r: Row) => JSON.stringify({ ...r, fullAddress: '' });
    if (!row || new Set(candidates.map(bins)).size !== 1) {
      throw addressNotFound(
        `City of Canterbury Bankstown has no property matching "${address.input}"`,
        { suggestions: [...new Set(candidates.map((r) => r.fullAddress))].slice(0, 5) },
      );
    }
    // Pattern 6 is one building with four collections a week; the rules for it aren't worth carrying.
    const services = row.tab === '6' ? [] : binsFor(row, today);
    if (!services.length) {
      throw parseError(`No bin services found for ${row.fullAddress}`, { url: DATA_URL });
    }
    return { matchedAddress: row.fullAddress, services, sourceUrl: DATA_URL };
  },
};
