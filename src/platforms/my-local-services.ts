import { z } from 'zod';
import { classifyBin } from '../core/bin-types.js';
import { addDays, compareDates, daysBetween, isLocalDate, weekdayIndex } from '../core/date.js';
import { addressNotFound, invalidInput } from '../core/errors.js';
import { expandRecurrence } from '../core/schedule.js';
import type { BinService, LocalDate } from '../core/types.js';
import type { CouncilAdapter, CouncilInfo } from '../councils/types.js';
import { queryArcGisPoint } from './arcgis.js';

/**
 * Adapter for South Australian councils, via the state's "My Local Services"
 * app. One public map service holds the collection zones of about 45 councils:
 *
 *   GET .../MyLocalServices/FeatureServer/<layer>/query?geometry=<point>
 *     -> features: [{ attributes: { Waste_Type, Colour, Col_Day, Col_Freq, Col_Offset } }]
 *
 * It works on zones, not addresses: the property is found by its coordinates,
 * so it needs a geocoded address, and a point geocoded to the wrong side of a
 * zone boundary gets its neighbour's days.
 *
 * A zone says "weekday, every N weeks, offset by M weeks". Weeks are counted
 * from 1 January, which is how the app's own schedule reads; this was checked
 * against Onkaparinga's website, which publishes real dates.
 */
const SERVICE =
  'https://services1.arcgis.com/37apdbovSVEwr4YE/ArcGIS/rest/services/MyLocalServices/FeatureServer';
/** General waste, recycling, green waste, and other collections. */
const LAYERS = [0, 1, 2, 4];

const Zone = z.object({
  Waste_Type: z.string(),
  Colour: z.string().nullish(),
  /** 1 = Sunday ... 7 = Saturday */
  Col_Day: z.number().int().min(1).max(7),
  /** Collected every this many weeks. */
  Col_Freq: z.number().int().positive(),
  /** Weeks after 1 January that the cycle starts. */
  Col_Offset: z.number().int().nonnegative(),
  /** Comma-separated dates the cycle skips, and extra ones it adds (holiday changes). */
  Exclusion: z.string().nullish(),
  Additional: z.string().nullish(),
});

/** The first collection on or after `today` for a zone's rule. Exported for tests. */
export function nextZoneCollection(
  today: LocalDate,
  rule: { day: number; everyWeeks: number; offsetWeeks: number },
): LocalDate {
  // shortcut: the cycle is re-counted from each 1 January, as the app does, so a fortnightly
  // bin's week may be off across New Year; re-check against a council's dates in January.
  const start = addDays(`${today.slice(0, 4)}-01-01` as LocalDate, rule.offsetWeeks * 7);
  const monday = addDays(start, -((weekdayIndex(start) + 6) % 7));
  const first = addDays(monday, (rule.day + 5) % 7);
  const from = compareDates(start, today) > 0 ? start : today;
  const step = rule.everyWeeks * 7;
  const behind = daysBetween(first, from);
  return behind > 0 ? addDays(first, Math.ceil(behind / step) * step) : first;
}

function listedDates(text: string | null | undefined): LocalDate[] {
  return (text ?? '')
    .split(',')
    .map((part) => part.trim())
    .filter(isLocalDate);
}

export function createMyLocalServicesCouncil(info: Omit<CouncilInfo, 'platform'>): CouncilAdapter {
  return {
    ...info,
    platform: 'my-local-services',
    async getSchedule(address, { http, today }) {
      const { latitude, longitude } = address;
      if (latitude == null || longitude == null) {
        throw invalidInput(`${info.name} lookups need an address that can be located on a map`);
      }
      const layers = await Promise.all(
        LAYERS.map((layer) =>
          queryArcGisPoint(
            http,
            `${SERVICE}/${layer}`,
            { latitude, longitude },
            'Waste_Type,Colour,Col_Day,Col_Freq,Col_Offset,Exclusion,Additional',
          ),
        ),
      );

      const services = new Map<string, BinService>();
      for (const attributes of layers.flatMap((layer) => layer.attributes)) {
        // A few zones are incomplete (no weekday, say); skip those rather than fail the lookup.
        const { data: zone } = Zone.safeParse(attributes);
        if (!zone) continue;
        const colour = zone.Colour?.trim().toLowerCase();
        const everyDays = zone.Col_Freq * 7;
        const anchor = nextZoneCollection(today, {
          day: zone.Col_Day,
          everyWeeks: zone.Col_Freq,
          offsetWeeks: zone.Col_Offset,
        });
        const skipped = listedDates(zone.Exclusion);
        const added = listedDates(zone.Additional).filter((d) => compareDates(d, today) >= 0);
        services.set(zone.Waste_Type, {
          type: classifyBin(zone.Waste_Type),
          name: zone.Waste_Type,
          ...(colour ? { colour } : {}),
          // Most zones are a plain cycle. One with holiday changes becomes this year's actual dates.
          recurrence:
            skipped.length || added.length
              ? {
                  kind: 'dates',
                  dates: [
                    ...expandRecurrence(
                      { kind: 'interval', everyDays, anchor },
                      today,
                      `${today.slice(0, 4)}-12-31` as LocalDate,
                    ).filter((d) => !skipped.includes(d)),
                    ...added,
                  ].sort(compareDates),
                }
              : { kind: 'interval', everyDays, anchor },
        });
      }
      if (!services.size) {
        throw addressNotFound(`${info.name} has no kerbside collection zone at "${address.input}"`);
      }
      return {
        matchedAddress: address.formatted ?? address.input,
        services: [...services.values()],
        sourceUrl: layers[0]?.url ?? SERVICE,
      };
    },
  };
}
