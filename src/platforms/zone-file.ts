import { z } from 'zod';
import { addressNotFound, invalidInput, parseError } from '../core/errors.js';
import { getJson, type HttpClient } from '../core/http.js';
import type { ResolvedAddress } from '../core/types.js';
import type { CouncilAdapter, CouncilInfo } from '../councils/types.js';
import { type Area, areaContains } from '../geo/contains.js';
import { OPEN_COUNCIL_BINS, type ZoneBin, zoneServices } from './zones.js';

/**
 * Adapter for councils that publish their collection zones as one GeoJSON
 * file: an open dataset on data.gov.au, or the file behind the council's Pozi
 * map (`https://config.pozi.com/public/production/<council>.json` names it).
 *
 * The whole file is read and the zone found by the property's coordinates, so
 * it needs a geocoded address, and a point geocoded to the wrong side of a
 * zone boundary gets its neighbour's days.
 */
export interface ZoneFileConfig extends Omit<CouncilInfo, 'platform'> {
  fileUrl: string;
  /** How each bin is read from a zone. Defaults to the Open Council Data fields. */
  bins?: ZoneBin[];
}

const ZoneFile = z.object({
  features: z.array(
    z.object({
      properties: z.record(z.string(), z.unknown()),
      geometry: z.custom<Area>((value) => Array.isArray((value as Area | null)?.coordinates)),
    }),
  ),
});

/** The fields of the zone the address is in. */
export async function findZone(
  http: HttpClient,
  fileUrl: string,
  address: ResolvedAddress,
  council: string,
): Promise<Record<string, unknown>> {
  const { latitude, longitude } = address;
  if (latitude == null || longitude == null) {
    throw invalidInput(`${council} lookups need an address that can be located on a map`);
  }
  // shortcut: the whole file (tens of kilobytes) is read for each lookup, and lookups are
  // cached for the day; keep the parsed file in memory if a council's file is ever large.
  const file = ZoneFile.safeParse(await getJson(http, fileUrl));
  if (!file.success) throw parseError(`Unexpected zone file from ${council}`, { url: fileUrl });
  const zone = file.data.features.find((f) => areaContains(f.geometry, { latitude, longitude }));
  if (!zone) {
    throw addressNotFound(`${council} has no kerbside collection zone at "${address.input}"`);
  }
  return zone.properties;
}

export function createZoneFileCouncil(config: ZoneFileConfig): CouncilAdapter {
  const { fileUrl, bins = OPEN_COUNCIL_BINS, ...info } = config;
  return {
    ...info,
    platform: 'zone-file',
    async getSchedule(address, { http, today }) {
      const zone = await findZone(http, fileUrl, address, info.name);
      const services = zoneServices(bins, zone, today);
      if (!services.length) {
        throw parseError(`No bin services found for ${info.name}`, { url: fileUrl });
      }
      return {
        matchedAddress: address.formatted ?? address.input,
        services,
        sourceUrl: fileUrl,
      };
    },
  };
}
