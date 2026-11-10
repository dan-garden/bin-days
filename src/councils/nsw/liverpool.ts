import { matchesHouseNumber, preferSuburb } from '../../core/address.js';
import { isLocalDate } from '../../core/date.js';
import { addressNotFound, invalidInput } from '../../core/errors.js';
import type { BinService } from '../../core/types.js';
import { odsString, queryOpendatasoft } from '../../platforms/opendatasoft.js';
import type { CouncilAdapter } from '../types.js';

/**
 * Liverpool City Council (NSW), via its open dataset "Bin collection days",
 * which lists every serviced address with a reference date and cycle length
 * for each bin.
 * https://data.liverpool.nsw.gov.au/explore/dataset/bin-collection-days/
 *
 * The reference dates are from when the dataset was published, so every date
 * returned is projected from the cycle.
 */
const PORTAL = 'https://data.liverpool.nsw.gov.au';
const DATASET = 'bin-collection-days';

interface LiverpoolRecord extends Record<string, unknown> {
  /** e.g. `37 THISTLE CIRCUIT GREEN VALLEY  NSW  2168`, `1/ 65 MEMORIAL AVENUE LIVERPOOL  NSW  2170` */
  gisaddress: string;
  garbagebin_week1: string | null;
  garbagebin_schedule: number | null;
  recyclebin_week1: string | null;
  recyclebin_schedule: number | null;
  organicbin_week1: string | null;
  organicbin_schedule: number | null;
}

const BINS = [
  { field: 'garbagebin', type: 'general', name: 'General waste', colour: 'red' },
  { field: 'recyclebin', type: 'recycling', name: 'Recycling', colour: 'yellow' },
  { field: 'organicbin', type: 'organics', name: 'Organics', colour: 'lime' },
] as const;

export const liverpool: CouncilAdapter = {
  id: 'nsw/liverpool',
  name: 'Liverpool City Council',
  state: 'NSW',
  lgaCodes: ['14900'],
  timezone: 'Australia/Sydney',
  website: `${PORTAL}/explore/dataset/${DATASET}/`,
  platform: 'opendatasoft',

  async getSchedule(address, { http }) {
    const { parts } = address;
    if (!parts.houseNumber || !parts.streetName) {
      throw invalidInput('Liverpool lookups need a house number and street', { parts });
    }
    const line = `${parts.houseNumber} ${parts.streetName} `.toUpperCase();
    const prefixes = parts.unit
      ? [`${parts.unit}/ ${line}`, `UNIT ${parts.unit}/ ${line}`]
      : [line];

    const { records, url } = await queryOpendatasoft<LiverpoolRecord>(http, {
      portal: PORTAL,
      dataset: DATASET,
      where: prefixes.map((p) => `startswith(gisaddress, ${odsString(p)})`).join(' or '),
      limit: 100,
    });

    const street = (parts.street ?? '').toUpperCase();
    const onStreet = records.filter(
      (r) =>
        matchesHouseNumber(r.gisaddress, parts) &&
        (!parts.streetType || r.gisaddress.includes(` ${street} `)),
    );
    const suburbOf = (r: LiverpoolRecord) =>
      r.gisaddress.slice(r.gisaddress.indexOf(street) + street.length, -11).trim();
    const candidates = preferSuburb(onStreet, parts.street ? suburbOf : () => '', parts.suburb);
    const record = candidates[0];
    if (!record || new Set(candidates.map((r) => r.gisaddress)).size !== 1) {
      throw addressNotFound(`Liverpool City Council has no property matching "${address.input}"`, {
        suggestions: (candidates.length ? candidates : records).slice(0, 5).map(formatAddress),
      });
    }

    const services: BinService[] = [];
    for (const { field, ...bin } of BINS) {
      const anchor = record[`${field}_week1`];
      const everyDays = record[`${field}_schedule`];
      if (anchor && isLocalDate(anchor) && everyDays) {
        services.push({ ...bin, recurrence: { kind: 'interval', everyDays, anchor } });
      }
    }

    return { matchedAddress: formatAddress(record), services, sourceUrl: url };
  },
};

/** The dataset pads its address parts with double spaces. */
function formatAddress(r: LiverpoolRecord): string {
  return r.gisaddress.replace(/\s+/g, ' ').replace('/ ', '/');
}
