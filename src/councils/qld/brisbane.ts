import { abbreviateStreetType } from '../../core/address.js';
import { isLocalDate } from '../../core/date.js';
import { addressNotFound, invalidInput } from '../../core/errors.js';
import type { BinService, LocalDate } from '../../core/types.js';
import { odsString, queryOpendatasoft } from '../../platforms/opendatasoft.js';
import type { CouncilAdapter } from '../types.js';

/**
 * Brisbane City Council, via the official open dataset "Waste and recycling:
 * Bin Collection Calendar", which lists every residential property with its
 * next red, yellow and green bin dates.
 * https://data.brisbane.qld.gov.au/explore/dataset/bin-collection-calendar/
 *
 * Red (general) bins go weekly. Yellow (recycling) and green (garden
 * organics) bins go fortnightly on alternating weeks. Green bins are an
 * opt-in subscription, so they're flagged `optional`.
 */
const PORTAL = 'https://data.brisbane.qld.gov.au';
const DATASET = 'bin-collection-calendar';

interface BrisbaneRecord extends Record<string, unknown> {
  property_id: string;
  unit_number: string | null;
  house_number: string | null;
  house_number_suffix: string | null;
  street_name: string;
  suburb: string;
  collection_day: string | null;
  next_red_bin: string | null;
  next_yellow_bin: string | null;
  next_green_bin: string | null;
}

export const brisbane: CouncilAdapter = {
  id: 'qld/brisbane',
  name: 'Brisbane City Council',
  state: 'QLD',
  lgaCodes: ['31000'],
  timezone: 'Australia/Brisbane',
  website: 'https://www.brisbane.qld.gov.au/clean-and-green/rubbish-tips-and-bins',
  platform: 'opendatasoft',

  async getSchedule(address, { http }) {
    const { parts } = address;
    if (!parts.houseNumber || !parts.streetName) {
      throw invalidInput('Brisbane lookups need a house number and street', { parts });
    }
    const [, number = parts.houseNumber, suffix] = /^(\d+)([A-Z]?)$/.exec(parts.houseNumber) ?? [];
    const streetName = parts.streetName.toUpperCase();
    const suburb = parts.suburb?.toUpperCase();

    const wantType = parts.streetType ? abbreviateStreetType(parts.streetType).toUpperCase() : '';
    const isType = (r: BrisbaneRecord) => r.street_name === `${streetName} ${wantType}`;

    const search = async (inSuburb?: string) => {
      const where = [
        `house_number=${odsString(number)}`,
        `street_name like ${odsString(`${streetName}%`)}`,
        inSuburb && `suburb=${odsString(inSuburb)}`,
      ]
        .filter(Boolean)
        .join(' and ');
      const { records, url } = await queryOpendatasoft<BrisbaneRecord>(http, {
        portal: PORTAL,
        dataset: DATASET,
        where,
        limit: 100,
      });
      const candidates = records
        .filter((r) => r.street_name === streetName || r.street_name.startsWith(`${streetName} `))
        .filter((r) => (r.house_number_suffix ?? '') === (suffix ?? ''))
        .filter((r) => !parts.unit || r.unit_number === parts.unit);
      return { records, candidates, url };
    };

    let { records, candidates, url } = await search(suburb);
    if (!candidates.length && suburb) {
      // People (and geocoders) often name the neighbouring suburb: Dornoch Tce
      // is "West End" to locals but HIGHGATE HILL to council. Look city-wide,
      // but only accept the result if it points at one street in one suburb,
      // and never swap the street type (8 Dornoch Tce is not 8 DORNOCH CRES).
      const cityWide = await search();
      const typed = wantType ? cityWide.candidates.filter(isType) : cityWide.candidates;
      const streets = new Set(typed.map((r) => `${r.street_name}|${r.suburb}`));
      if (streets.size === 1) ({ candidates, url } = { ...cityWide, candidates: typed });
      records = cityWide.candidates.length ? cityWide.candidates : cityWide.records;
    }

    // Prefer an exact street type match, then a whole-property record over individual units.
    const score = (r: BrisbaneRecord) =>
      (wantType && isType(r) ? 2 : 0) + (r.unit_number == null ? 1 : 0);
    const record = candidates.sort((a, b) => score(b) - score(a))[0];

    if (!record) {
      throw addressNotFound(`Brisbane City Council has no property matching "${address.input}"`, {
        suggestions: [...new Set(records.map(formatAddress))].slice(0, 5),
      });
    }

    const services: BinService[] = [];
    const add = (
      date: string | null,
      service: Omit<BinService, 'recurrence'>,
      everyDays: number,
    ) => {
      if (date && isLocalDate(date)) {
        services.push({
          ...service,
          recurrence: { kind: 'interval', everyDays, anchor: date as LocalDate },
        });
      }
    };
    add(
      record.next_red_bin,
      { type: 'general', name: 'General waste (red lid)', colour: 'red' },
      7,
    );
    add(
      record.next_yellow_bin,
      { type: 'recycling', name: 'Recycling (yellow lid)', colour: 'yellow' },
      14,
    );
    add(
      record.next_green_bin,
      {
        type: 'organics',
        name: 'Garden organics (green lid)',
        colour: 'green',
        optional: true,
        notes: 'Green bins are an opt-in subscription service.',
      },
      14,
    );

    return {
      matchedAddress: formatAddress(record),
      propertyId: record.property_id,
      services,
      sourceUrl: url,
    };
  },
};

function formatAddress(r: BrisbaneRecord): string {
  const number = `${r.house_number ?? ''}${r.house_number_suffix ?? ''}`;
  const prefix = r.unit_number ? `${r.unit_number}/${number}` : number;
  return `${prefix} ${r.street_name}, ${r.suburb} QLD`.trim();
}
