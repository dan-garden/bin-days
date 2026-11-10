import { DEFAULT_COLOURS } from '../core/bin-types.js';
import { isLocalDate } from '../core/date.js';
import { addressNotFound, invalidInput, parseError } from '../core/errors.js';
import type { BinService, BinType, LocalDate } from '../core/types.js';
import type { CouncilAdapter, CouncilInfo } from '../councils/types.js';
import { queryArcGisPoint } from './arcgis.js';

/**
 * Adapter for councils that publish collection zones as an ArcGIS map layer
 * where each zone carries a date for each bin. The property is found by its
 * coordinates, so it needs a geocoded address, and a point geocoded to the
 * wrong side of a zone boundary gets its neighbour's days.
 *
 * Zones that only give "Monday, week 2" are not enough for this adapter: a
 * week number means nothing without a date to count from.
 */
export interface ArcGisZoneBin {
  type: BinType;
  name: string;
  /** The zone field holding a collection date: `YYYY-MM-DD` text or a timestamp. */
  dateField: string;
  /** The cycle in days, or the zone field that holds it in weeks. */
  everyDays?: number;
  weeksField?: string;
}

export interface ArcGisZonesConfig extends Omit<CouncilInfo, 'platform'> {
  /** The layer's address, ending in `/FeatureServer/<n>` or `/MapServer/<n>`. */
  layerUrl: string;
  bins: ArcGisZoneBin[];
}

/** ArcGIS dates are either text or milliseconds since 1970 at midnight UTC. */
function zoneDate(value: unknown): LocalDate | undefined {
  const text =
    typeof value === 'number' ? new Date(value).toISOString().slice(0, 10) : String(value ?? '');
  return isLocalDate(text.slice(0, 10)) ? (text.slice(0, 10) as LocalDate) : undefined;
}

export function createArcGisZonesCouncil(config: ArcGisZonesConfig): CouncilAdapter {
  const { layerUrl, bins, ...info } = config;
  return {
    ...info,
    platform: 'arcgis-zones',
    async getSchedule(address, { http }) {
      const { latitude, longitude } = address;
      if (latitude == null || longitude == null) {
        throw invalidInput(`${info.name} lookups need an address that can be located on a map`);
      }
      const { attributes, url } = await queryArcGisPoint(http, layerUrl, { latitude, longitude });
      const [zone] = attributes;
      if (!zone) {
        throw addressNotFound(`${info.name} has no kerbside collection zone at "${address.input}"`);
      }

      const services: BinService[] = [];
      for (const bin of bins) {
        const anchor = zoneDate(zone[bin.dateField]);
        if (!anchor) continue;
        const weeks = bin.weeksField ? Number(zone[bin.weeksField]) : undefined;
        const everyDays = weeks ? weeks * 7 : bin.everyDays;
        const colour = DEFAULT_COLOURS[bin.type];
        services.push({
          type: bin.type,
          name: bin.name,
          ...(colour ? { colour } : {}),
          recurrence: everyDays
            ? { kind: 'interval', everyDays, anchor }
            : { kind: 'dates', dates: [anchor] },
        });
      }
      if (!services.length) throw parseError(`No bin services found for ${info.name}`, { url });
      return {
        matchedAddress: address.formatted ?? address.input,
        services,
        sourceUrl: url,
      };
    },
  };
}
