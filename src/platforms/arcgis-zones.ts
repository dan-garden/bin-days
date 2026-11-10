import { isLocalDate, nextWeekday, toLocalDate, weekdayInWeekOf } from '../core/date.js';
import { addressNotFound, invalidInput, parseError } from '../core/errors.js';
import { binService } from '../core/schedule.js';
import type { BinService, BinType, LocalDate } from '../core/types.js';
import type { CouncilAdapter, CouncilInfo } from '../councils/types.js';
import { findArcGisAddress, queryArcGisPoint } from './arcgis.js';

/**
 * Adapter for councils that publish their collections as an ArcGIS map layer,
 * either as zones or as a list of properties. A zone is found by the
 * property's coordinates, so it needs a geocoded address, and a point geocoded
 * to the wrong side of a zone boundary gets its neighbour's days.
 *
 * A bin's dates come from the layer in one of two ways:
 *
 * - a field holding one of its collection dates (`dateField`), or
 * - a field holding its weekday (`dayField`). That is enough for a weekly bin.
 *   A fortnightly one also needs `weekOf`: a date in a week it is collected.
 *   Take that from the council's own material (its calendar, or the formula in
 *   its public map), never from a guess: "Monday, week 2" means nothing
 *   without a date to count from.
 */
export interface ArcGisZoneBin {
  type: BinType;
  name: string;
  /** The field holding a collection date: `YYYY-MM-DD` text or a timestamp. */
  dateField?: string;
  /** The field holding the bin's weekday, for layers that give no date. */
  dayField?: string;
  /**
   * With `dayField`, a date (`YYYY-MM-DD`) in a week the bin is collected. Where the council's
   * areas alternate, one for each value of the layer's `weekField`.
   */
  weekOf?: string | Record<string, string>;
  /** The cycle in days, or the field that holds it in weeks. */
  everyDays?: number;
  weeksField?: string;
}

export interface ArcGisZonesConfig extends Omit<CouncilInfo, 'platform'> {
  /** The layer's address, ending in `/FeatureServer/<n>` or `/MapServer/<n>`. */
  layerUrl: string;
  /** For a layer of properties rather than zones: the field holding each one's address. */
  addressField?: string;
  /** The field saying which of the council's alternating areas a zone or property is in. */
  weekField?: string;
  bins: ArcGisZoneBin[];
}

/** ArcGIS dates are either text or milliseconds since 1970 at midnight UTC. */
function zoneDate(value: unknown): LocalDate | undefined {
  const text =
    typeof value === 'number' ? new Date(value).toISOString().slice(0, 10) : String(value ?? '');
  return isLocalDate(text.slice(0, 10)) ? (text.slice(0, 10) as LocalDate) : undefined;
}

export function createArcGisZonesCouncil(config: ArcGisZonesConfig): CouncilAdapter {
  const { layerUrl, addressField, weekField, bins, ...info } = config;

  /** One of the bin's collection dates, from whichever of the two ways its config names. */
  const anchorOf = (bin: ArcGisZoneBin, zone: Record<string, unknown>, today: LocalDate) => {
    if (bin.dateField) return zoneDate(zone[bin.dateField]);
    const day = String(zone[bin.dayField ?? ''] ?? '');
    if (!bin.weekOf) return nextWeekday(day, today);
    const week =
      typeof bin.weekOf === 'string' ? bin.weekOf : bin.weekOf[String(zone[weekField ?? ''])];
    return week ? weekdayInWeekOf(day, toLocalDate(week)) : undefined;
  };

  return {
    ...info,
    platform: 'arcgis-zones',
    async getSchedule(address, { http, today }) {
      let zone: Record<string, unknown> | undefined;
      let url: string;
      let matchedAddress = address.formatted ?? address.input;
      if (addressField) {
        const found = await findArcGisAddress(http, layerUrl, addressField, address, {
          council: info.name,
        });
        ({ attributes: zone, url } = found);
        matchedAddress = String(zone[addressField]).replace(/\s+/g, ' ');
      } else {
        const { latitude, longitude } = address;
        if (latitude == null || longitude == null) {
          throw invalidInput(`${info.name} lookups need an address that can be located on a map`);
        }
        const found = await queryArcGisPoint(http, layerUrl, { latitude, longitude });
        [zone] = found.attributes;
        url = found.url;
      }
      if (!zone) {
        throw addressNotFound(`${info.name} has no kerbside collection zone at "${address.input}"`);
      }

      const services: BinService[] = [];
      for (const bin of bins) {
        const anchor = anchorOf(bin, zone, today);
        if (!anchor) continue;
        const weeks = bin.weeksField ? Number(zone[bin.weeksField]) : undefined;
        const everyDays = weeks ? weeks * 7 : bin.everyDays;
        services.push(binService(bin.type, bin.name, anchor, everyDays));
      }
      if (!services.length) throw parseError(`No bin services found for ${info.name}`, { url });
      return { matchedAddress, services, sourceUrl: url };
    },
  };
}
