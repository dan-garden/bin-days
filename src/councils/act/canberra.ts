import { parseAustralianDate } from '../../core/date.js';
import { addressNotFound, invalidInput, parseError } from '../../core/errors.js';
import { getJson } from '../../core/http.js';
import { parseFrequency } from '../../core/schedule.js';
import type { BinService } from '../../core/types.js';
import type { CouncilAdapter } from '../types.js';

/**
 * Canberra and the rest of the ACT, via the ACT Government's open dataset
 * "Household waste and recycling collection days". The ACT has no councils;
 * the territory government runs collections.
 * https://www.data.act.gov.au/d/jzzy-44un
 *
 * The data is one row per suburb, with each bin's next date and how often it
 * goes. Three suburbs are split into parts collected on different days, and
 * the dataset doesn't say which streets are in which part, so those can't be
 * answered from an address.
 */
const DATASET = 'https://www.data.act.gov.au/resource/jzzy-44un.json';

interface SuburbRow {
  suburb: string;
  split_suburb?: string;
  garbage_collection_frequency?: string;
  garbage_pickup_date?: string;
  recycling_collection_frequency?: string;
  recycling_pickup_date?: string;
  greenwaste_collection_frequency?: string;
  next_greenwaste_date?: string;
  /** "Greenwaste", or "FOGO" where food scraps go in too. */
  greenwaste_type?: string;
}

export const canberra: CouncilAdapter = {
  id: 'act/canberra',
  name: 'Canberra (ACT Government)',
  state: 'ACT',
  lgaCodes: ['89399'],
  timezone: 'Australia/Sydney',
  website:
    'https://www.cityservices.act.gov.au/recycling-and-waste/collection/bin-collection-calendar',
  platform: 'socrata',

  async getSchedule(address, { http }) {
    const suburb = address.parts.suburb?.toUpperCase();
    if (!suburb) throw invalidInput('ACT lookups need a suburb', { parts: address.parts });

    const url = `${DATASET}?suburb=${encodeURIComponent(suburb)}`;
    const rows = await getJson<SuburbRow[]>(http, url);
    if (!Array.isArray(rows)) throw parseError('Unexpected response from data.act.gov.au', { url });
    const [row] = rows;
    if (!row) throw addressNotFound(`The ACT has no collection listed for the suburb "${suburb}"`);
    if (rows.length > 1) {
      const parts = rows.map((r) => r.split_suburb).join(', ');
      throw addressNotFound(
        `${row.suburb} is collected on different days in different parts (${parts}), and the ACT doesn't publish which streets are in each. Check the ACT Government's bin calendar.`,
      );
    }

    const services: BinService[] = [];
    const add = (bin: Omit<BinService, 'recurrence'>, date?: string, frequency?: string) => {
      const anchor = parseAustralianDate(date ?? '');
      const everyDays = parseFrequency(frequency ?? '');
      if (!anchor) return;
      services.push({
        ...bin,
        recurrence: everyDays
          ? { kind: 'interval', everyDays, anchor }
          : { kind: 'dates', dates: [anchor] },
      });
    };
    add(
      { type: 'general', name: 'Rubbish', colour: 'red' },
      row.garbage_pickup_date,
      row.garbage_collection_frequency,
    );
    add(
      { type: 'recycling', name: 'Recycling', colour: 'yellow' },
      row.recycling_pickup_date,
      row.recycling_collection_frequency,
    );
    add(
      {
        type: 'organics',
        name: row.greenwaste_type === 'FOGO' ? 'Food and garden organics' : 'Green waste',
        colour: 'lime',
        ...(row.greenwaste_type === 'FOGO'
          ? {}
          : { optional: true, notes: 'Green waste bins are an opt-in service in the ACT.' }),
      },
      row.next_greenwaste_date,
      row.greenwaste_collection_frequency,
    );

    return { matchedAddress: `${row.suburb}, ACT`, services, sourceUrl: url };
  },
};
