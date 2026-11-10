import { z } from 'zod';
import { matchesHouseNumber } from '../core/address.js';
import { addressNotFound, invalidInput, parseError } from '../core/errors.js';
import { getJson, type HttpClient } from '../core/http.js';
import type { ResolvedAddress } from '../core/types.js';

/**
 * Helpers for councils and states that publish collection zones as an ArcGIS
 * map layer (`.../FeatureServer/<n>` or `.../MapServer/<n>`).
 */
const Features = z.object({
  features: z
    .array(
      z.object({
        attributes: z.record(z.string(), z.unknown()),
        geometry: z.object({ x: z.number(), y: z.number() }).optional(),
      }),
    )
    .default([]),
});
type Feature = z.infer<typeof Features>['features'][number];

async function query(
  http: HttpClient,
  layerUrl: string,
  params: Record<string, string>,
): Promise<{ features: Feature[]; url: string }> {
  const search = new URLSearchParams({ outFields: '*', returnGeometry: 'false', ...params });
  const url = `${layerUrl.replace(/\/(query)?$/, '')}/query?${search}&f=json`;
  const parsed = Features.safeParse(await getJson(http, url));
  if (!parsed.success) throw parseError(`Unexpected response from ${new URL(url).host}`, { url });
  return { features: parsed.data.features, url };
}

/** The attributes of every feature in a layer that contains a point. */
export async function queryArcGisPoint(
  http: HttpClient,
  layerUrl: string,
  point: { latitude: number; longitude: number },
  outFields = '*',
): Promise<{ attributes: Array<Record<string, unknown>>; url: string }> {
  const { features, url } = await query(http, layerUrl, {
    geometry: JSON.stringify({
      x: point.longitude,
      y: point.latitude,
      spatialReference: { wkid: 4326 },
    }),
    geometryType: 'esriGeometryPoint',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields,
  });
  return { attributes: features.map((feature) => feature.attributes), url };
}

/**
 * The one property matching an address, in a layer that lists properties with
 * their address as one line of text ("12 EXAMPLE ST SUBURB 3000"). The
 * given suburb is preferred, and a lone match elsewhere is accepted.
 */
export async function findArcGisAddress(
  http: HttpClient,
  layerUrl: string,
  addressField: string,
  address: ResolvedAddress,
  { council, withLocation = false }: { council: string; withLocation?: boolean },
): Promise<Feature & { url: string }> {
  const { parts } = address;
  if (!parts.houseNumber || !parts.street) {
    throw invalidInput(`${council} lookups need a house number and street`, { parts });
  }
  // Layers differ in spacing and in how they shorten "Street", so search on the number and the
  // street's name, and let `matchesHouseNumber` judge what comes back.
  const number = `${parts.unit ? `${parts.unit}/` : ''}${parts.houseNumber}`;
  const name = (parts.streetName ?? parts.street).toUpperCase().replace(/'/g, "''");
  const { features, url } = await query(http, layerUrl, {
    where: `UPPER(${addressField}) LIKE '${number.toUpperCase()} %${name} %'`,
    returnGeometry: String(withLocation),
    resultRecordCount: '50',
  });
  const text = (feature: Feature) =>
    String(feature.attributes[addressField] ?? '').replace(/\s+/g, ' ');
  const matches = features.filter((feature) => matchesHouseNumber(text(feature), parts));
  const suburb = ` ${parts.suburb?.toUpperCase()} `;
  const inSuburb = matches.filter((feature) => `${text(feature).toUpperCase()} `.includes(suburb));
  const candidates = inSuburb.length ? inSuburb : matches;
  const [found] = candidates;
  if (!found || candidates.length > 1) {
    throw addressNotFound(`${council} has no property matching "${address.input}"`, {
      suggestions: candidates.slice(0, 5).map(text),
    });
  }
  return { ...found, url };
}
