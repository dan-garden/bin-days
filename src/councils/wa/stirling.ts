import { parseAustralianDate } from '../../core/date.js';
import { addressNotFound, invalidInput } from '../../core/errors.js';
import { getJson } from '../../core/http.js';
import { binService } from '../../core/schedule.js';
import type { BinService, BinType } from '../../core/types.js';
import type { CouncilAdapter } from '../types.js';

/**
 * City of Stirling, via the lookup behind the council's bin collections page.
 * It takes a location and returns each bin's next date. The property is found
 * by its coordinates, so it needs a geocoded address.
 */
const URL = 'https://www.stirling.wa.gov.au/bincollectioncheck/getresult';
/** Which of the council's lookups to run, as its own page asks for it. */
const LOOKUP = {
  configid: '7c833520-7b62-4228-8522-fb1a220b32e8',
  form: '57753bab-f589-44d7-8934-098b6d5c572f',
  apikeylookup: 'Bin Day',
};

/** The bins as the lookup names them. The cycles are the ones the council's page gives. */
const BINS: Record<string, { type: BinType; name: string; everyDays?: number }> = {
  Red: { type: 'general', name: 'General waste', everyDays: 7 },
  Yellow: { type: 'recycling', name: 'Recycling', everyDays: 14 },
  Green: { type: 'organics', name: 'Garden organics', everyDays: 14 },
  GreenVerge: { type: 'bulky', name: 'Bulk green waste verge collection' },
};

type Field = { name: string; value: unknown };

export const stirling: CouncilAdapter = {
  id: 'wa/stirling',
  name: 'City of Stirling',
  state: 'WA',
  lgaCodes: ['57910'],
  timezone: 'Australia/Perth',
  website:
    'https://www.stirling.wa.gov.au/waste-and-environment/waste-and-recycling/bin-collections',
  platform: 'council-api',

  async getSchedule(address, { http }) {
    const { latitude, longitude } = address;
    if (latitude == null || longitude == null) {
      throw invalidInput('City of Stirling lookups need an address that can be located on a map');
    }
    const answer = await getJson<Field[][] | string>(http, URL, {
      headers: { ...LOOKUP, fields: `${longitude},${latitude}` },
    });
    // The answer arrives either as JSON or as JSON inside a string.
    const rows: Field[][] = typeof answer === 'string' ? JSON.parse(answer) : answer;

    const services: BinService[] = [];
    for (const row of Array.isArray(rows) ? rows : []) {
      const value = (name: string) => String(row.find((field) => field.name === name)?.value ?? '');
      const bin = BINS[value('type')];
      // Mostly written "Nov 10 2026"; the parser wants the day first.
      const date = parseAustralianDate(value('date').replace(/^([A-Za-z]+)\s+(\d+)/, '$2 $1'));
      if (bin && date) services.push(binService(bin.type, bin.name, date, bin.everyDays));
    }
    if (!services.length) {
      throw addressNotFound(`City of Stirling has no kerbside collection at "${address.input}"`);
    }
    return { matchedAddress: address.formatted ?? address.input, services, sourceUrl: URL };
  },
};
