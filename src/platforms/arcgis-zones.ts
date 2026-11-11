import { addressNotFound, invalidInput, parseError } from '../core/errors.js';
import type { CouncilAdapter, CouncilInfo } from '../councils/types.js';
import { findArcGisAddress, queryArcGisPoint } from './arcgis.js';
import { type ZoneBin, zoneServices } from './zones.js';

/**
 * Adapter for councils that publish their collections as an ArcGIS map layer,
 * either as zones or as a list of properties. A zone is found by the
 * property's coordinates, so it needs a geocoded address, and a point geocoded
 * to the wrong side of a zone boundary gets its neighbour's days.
 *
 * How each bin is read from the layer's fields is described on `ZoneBin`.
 */
export interface ArcGisZonesConfig extends Omit<CouncilInfo, 'platform'> {
  /** The layer's address, ending in `/FeatureServer/<n>` or `/MapServer/<n>`. */
  layerUrl: string;
  /** For a layer of properties rather than zones: the field holding each one's address. */
  addressField?: string;
  /** The field saying which of the council's alternating areas a zone or property is in. */
  weekField?: string;
  bins: ZoneBin[];
}

export function createArcGisZonesCouncil(config: ArcGisZonesConfig): CouncilAdapter {
  const { layerUrl, addressField, weekField, bins, ...info } = config;

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

      const services = zoneServices(bins, zone, today, weekField);
      if (!services.length) throw parseError(`No bin services found for ${info.name}`, { url });
      return { matchedAddress, services, sourceUrl: url };
    },
  };
}
