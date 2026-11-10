import { z } from 'zod';
import { parseError } from '../core/errors.js';
import { getJson, type HttpClient } from '../core/http.js';

/**
 * Helpers for councils and states that publish collection zones as an ArcGIS
 * map layer (`.../FeatureServer/<n>` or `.../MapServer/<n>`).
 */
const Features = z.object({
  features: z.array(z.object({ attributes: z.record(z.string(), z.unknown()) })).default([]),
});

/** The attributes of every feature in a layer that contains a point. */
export async function queryArcGisPoint(
  http: HttpClient,
  layerUrl: string,
  point: { latitude: number; longitude: number },
  outFields = '*',
): Promise<{ attributes: Array<Record<string, unknown>>; url: string }> {
  const query = new URLSearchParams({
    geometry: JSON.stringify({
      x: point.longitude,
      y: point.latitude,
      spatialReference: { wkid: 4326 },
    }),
    geometryType: 'esriGeometryPoint',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields,
    returnGeometry: 'false',
    f: 'json',
  });
  const url = `${layerUrl.replace(/\/(query)?$/, '')}/query?${query}`;
  const parsed = Features.safeParse(await getJson(http, url));
  if (!parsed.success) throw parseError(`Unexpected response from ${new URL(url).host}`, { url });
  return { attributes: parsed.data.features.map((feature) => feature.attributes), url };
}
