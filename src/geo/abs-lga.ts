import { z } from 'zod';
import { normaliseState } from '../core/address.js';
import { getJson, type HttpClient } from '../core/http.js';
import type { Lga, LgaResolver } from './types.js';

/**
 * Resolve the Local Government Area for a point using the Australian Bureau
 * of Statistics' public ASGS boundary service. Official, free, no API key.
 * LGA codes are the stable key that routes an address to a council adapter.
 */
const EDITION = '2024';
const SERVICE = `https://geo.abs.gov.au/arcgis/rest/services/ASGS${EDITION}/LGA/MapServer/0/query`;

const ArcGisResponse = z.object({
  features: z
    .array(
      z.object({ attributes: z.record(z.string(), z.union([z.string(), z.number(), z.null()])) }),
    )
    .default([]),
});

const GeoJsonResponse = z.object({
  features: z
    .array(
      z.object({
        properties: z.record(z.string(), z.unknown()),
        geometry: z.object({ type: z.string(), coordinates: z.unknown() }),
      }),
    )
    .default([]),
});

/** About 200 m: fine for a coverage map, and keeps a few dozen councils near 250 kB. */
const SIMPLIFY_DEGREES = '0.002';

export function createAbsLgaResolver(http: HttpClient, serviceUrl = SERVICE): LgaResolver {
  return {
    async lookup(latitude, longitude) {
      const url = new URL(serviceUrl);
      url.search = new URLSearchParams({
        geometry: `${longitude},${latitude}`,
        geometryType: 'esriGeometryPoint',
        inSR: '4326',
        spatialRel: 'esriSpatialRelIntersects',
        outFields: `lga_code_${EDITION},lga_name_${EDITION},state_name_2021`,
        returnGeometry: 'false',
        f: 'json',
      }).toString();

      const { features } = ArcGisResponse.parse(await getJson(http, url));
      const attrs = features[0]?.attributes;
      const code = attrs?.[`lga_code_${EDITION}`];
      const name = attrs?.[`lga_name_${EDITION}`];
      if (code == null || name == null) return undefined;

      const lga: Lga = { code: String(code), name: String(name) };
      const state = normaliseState(String(attrs?.state_name_2021 ?? ''));
      if (state) lga.state = state;
      return lga;
    },

    async boundaries(codes) {
      if (!codes.length) return [];
      // POST, because a long list of codes would overflow a query string.
      const body = new URLSearchParams({
        where: `lga_code_${EDITION} IN (${codes.map((c) => `'${c.replace(/'/g, "''")}'`).join(',')})`,
        outFields: `lga_code_${EDITION}`,
        outSR: '4326',
        maxAllowableOffset: SIMPLIFY_DEGREES,
        geometryPrecision: '4',
        f: 'geojson',
      });
      const { features } = GeoJsonResponse.parse(
        await getJson(http, serviceUrl, { method: 'POST', body }),
      );
      return features.map((f) => ({
        code: String(f.properties[`lga_code_${EDITION}`]),
        geometry: f.geometry,
      }));
    },
  };
}
