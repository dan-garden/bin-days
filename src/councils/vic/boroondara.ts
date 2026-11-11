import { nextWeekday, toLocalDate, weekdayInWeekOf } from '../../core/date.js';
import { addressNotFound, invalidInput, parseError } from '../../core/errors.js';
import { getText } from '../../core/http.js';
import { binService } from '../../core/schedule.js';
import { type Area, areaContains } from '../../geo/contains.js';
import type { CouncilAdapter } from '../types.js';

/**
 * City of Boroondara, whose "find your bin day" page carries its collection
 * areas inside its script: each area's outline, weekday and week (A or B).
 * The area is found by the property's coordinates, so it needs a geocoded address.
 */
const PAGE =
  'https://www.boroondara.vic.gov.au/services/waste-and-recycling/bins/find-your-bin-day';

/**
 * A date in a week each area's fortnightly household waste is collected. The page's script
 * counts from Sunday 2 April 2023: area A that week, area B the weeks between.
 */
const WASTE_WEEK: Record<string, string> = { A: '2023-04-03', B: '2023-04-10' };

interface Zone {
  geometry: Area;
  properties: { day: string; week: string };
}

/** The areas in the page's script, which writes them as a JavaScript value. Exported for tests. */
export function parseZones(script: string): Zone[] {
  const [, literal] = /polygonData=(\{.*?\}),boroondaraCoords=/s.exec(script) ?? [];
  if (!literal) return [];
  // Quote the property names to make it JSON.
  return JSON.parse(literal.replace(/([{,])([A-Za-z_]\w*):/g, '$1"$2":')).features;
}

export const boroondara: CouncilAdapter = {
  id: 'vic/boroondara',
  name: 'City of Boroondara',
  state: 'VIC',
  lgaCodes: ['21110'],
  timezone: 'Australia/Melbourne',
  website: PAGE,
  platform: 'council-api',
  async getSchedule(address, { http, today }) {
    const { latitude, longitude } = address;
    if (latitude == null || longitude == null) {
      throw invalidInput(`${this.name} lookups need an address that can be located on a map`);
    }
    // The script's name carries a version, so it is read from the page.
    const [url] = /https:[^"']+\/binday\/js\/main[^"']*\.js/.exec(await getText(http, PAGE)) ?? [];
    if (!url) throw parseError("Boroondara's bin day page has changed", { url: PAGE });
    const zones = parseZones(await getText(http, url));
    if (!zones.length) throw parseError("Boroondara's bin day script has changed", { url });

    const zone = zones.find((z) => areaContains(z.geometry, { latitude, longitude }));
    const { day = '', week = '' } = zone?.properties ?? {};
    const weekly = nextWeekday(day, today);
    const waste = WASTE_WEEK[week] && weekdayInWeekOf(day, toLocalDate(WASTE_WEEK[week]));
    if (!weekly || !waste) {
      throw addressNotFound(`${this.name} has no kerbside collection zone at "${address.input}"`);
    }
    return {
      matchedAddress: address.formatted ?? address.input,
      services: [
        binService('general', 'Household waste', waste, 14),
        binService('recycling', 'Recycling', weekly, 7),
        binService('organics', 'Food and garden organics', weekly, 7),
      ],
      sourceUrl: url,
    };
  },
};
