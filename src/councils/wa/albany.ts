import { addDays, compareDates, toLocalDate, weekdayInWeekOf } from '../../core/date.js';
import { addressNotFound, invalidInput } from '../../core/errors.js';
import { binService, expandRecurrence } from '../../core/schedule.js';
import type { LocalDate } from '../../core/types.js';
import { queryArcGisPoint } from '../../platforms/arcgis.js';
import type { CouncilAdapter } from '../types.js';

/**
 * City of Albany, from the four layers of its collection map: general waste and FOGO areas, and
 * recycling areas, each split into zone A and zone B. Every area says which weekday it's on; the
 * fortnights come from the dates the map's own pop-up counts from. FOGO also goes out on
 * recycling weeks in summer, which only the council's printed calendar says.
 */
const SERVICES = 'https://services6.arcgis.com/qG6LEFhXeMyvh3U3/arcgis/rest/services';
const ZONES = [
  {
    waste: 'Trash_Pickup_A',
    wasteWeek: '2021-06-28',
    recycling: 'Recycling_Pickup_A',
    recyclingWeek: '2021-06-22',
  },
  {
    waste: 'Trash_Pickup_B',
    wasteWeek: '2021-06-21',
    recycling: 'Recycling_Pickup_B',
    recyclingWeek: '2021-06-28',
  },
];
// shortcut: only the summer in the 2026 calendar is known; add each year's from the council's
// calendar (it gives "21 December 2026 to 12 February 2027"), or FOGO shows as fortnightly then.
const SUMMERS: Array<[LocalDate, LocalDate]> = [
  [toLocalDate('2026-12-21'), toLocalDate('2027-02-12')],
];
const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/** The weekday an area's row marks "Yes". */
const dayOf = (area: Record<string, unknown> | undefined) =>
  WEEKDAYS.find((day) => String(area?.[day] ?? '').toLowerCase() === 'yes');

export const albany: CouncilAdapter = {
  id: 'wa/albany',
  name: 'City of Albany',
  state: 'WA',
  lgaCodes: ['50080'],
  timezone: 'Australia/Perth',
  website: 'https://www.albany.wa.gov.au',
  platform: 'arcgis-zones',
  async getSchedule(address, { http, today }) {
    const { latitude, longitude } = address;
    if (latitude == null || longitude == null) {
      throw invalidInput(`${this.name} lookups need an address that can be located on a map`);
    }
    const layer = (name: string) => `${SERVICES}/${name}/FeatureServer/0`;
    for (const zone of ZONES) {
      const waste = await queryArcGisPoint(http, layer(zone.waste), { latitude, longitude });
      const wasteDay = dayOf(waste.attributes[0]);
      if (!wasteDay) continue;
      const recycling = await queryArcGisPoint(http, layer(zone.recycling), {
        latitude,
        longitude,
      });
      const recyclingDay = dayOf(recycling.attributes[0]) ?? wasteDay;

      const wasteAnchor = weekdayInWeekOf(wasteDay, toLocalDate(zone.wasteWeek))!;
      const recyclingAnchor = weekdayInWeekOf(recyclingDay, toLocalDate(zone.recyclingWeek))!;
      // FOGO: every waste week, and every recycling week in summer.
      const end = addDays(today, 365);
      const summerRecycling = expandRecurrence(
        { kind: 'interval', everyDays: 14, anchor: recyclingAnchor },
        today,
        end,
      ).filter((date) =>
        SUMMERS.some(([from, to]) => compareDates(date, from) >= 0 && compareDates(date, to) <= 0),
      );
      const fogo = [
        ...expandRecurrence({ kind: 'interval', everyDays: 14, anchor: wasteAnchor }, today, end),
        ...summerRecycling,
      ].sort(compareDates);
      return {
        matchedAddress: address.formatted ?? address.input,
        services: [
          binService('general', 'General waste', wasteAnchor, 14),
          binService('recycling', 'Recycling', recyclingAnchor, 14),
          {
            ...binService('organics', 'FOGO', fogo[0]!),
            recurrence: { kind: 'dates', dates: fogo },
          },
        ],
        sourceUrl: waste.url,
      };
    }
    throw addressNotFound(`${this.name} has no kerbside collection area at "${address.input}"`);
  },
};
