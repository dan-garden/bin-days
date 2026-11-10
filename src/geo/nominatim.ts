import { z } from 'zod';
import { normaliseState } from '../core/address.js';
import { getJson, type HttpClient, rateLimit } from '../core/http.js';
import type { GeocodeHints, GeocodeResult, Geocoder } from './types.js';

/**
 * Geocoder backed by OpenStreetMap Nominatim. Free, no API key. The public
 * instance allows at most 1 request/second and requires an identifying
 * User-Agent (set BIN_DAYS_USER_AGENT); results are cached by the service.
 * https://operations.osmfoundation.org/policies/nominatim/
 */
const NominatimResults = z.array(
  z.object({
    lat: z.string(),
    lon: z.string(),
    display_name: z.string(),
    address: z.record(z.string(), z.string()).default({}),
  }),
);

export interface NominatimOptions {
  baseUrl?: string;
  /** Minimum ms between requests. Defaults to 1100 for the public instance, 0 for self-hosted. */
  minIntervalMs?: number;
}

export function createNominatimGeocoder(
  http: HttpClient,
  options: NominatimOptions = {},
): Geocoder {
  const baseUrl = (options.baseUrl || 'https://nominatim.openstreetmap.org').replace(/\/$/, '');
  const isPublic = baseUrl.includes('nominatim.openstreetmap.org');
  const throttle = rateLimit(options.minIntervalMs ?? (isPublic ? 1100 : 0));

  return {
    async geocode(address, hints = {}) {
      const url = new URL(`${baseUrl}/search`);
      url.search = new URLSearchParams({
        q: address,
        format: 'jsonv2',
        addressdetails: '1',
        countrycodes: 'au',
        limit: '5',
      }).toString();

      const json = await throttle(() => getJson(http, url));
      const candidates = NominatimResults.parse(json).map(toResult);
      return pickBest(candidates, hints);
    },
  };
}

function toResult(r: z.infer<typeof NominatimResults>[number]): GeocodeResult {
  const a = r.address;
  const suburb = a.suburb ?? a.town ?? a.village ?? a.hamlet ?? a.city_district;
  const state = normaliseState(a.state);
  const result: GeocodeResult = {
    latitude: Number(r.lat),
    longitude: Number(r.lon),
    formatted: r.display_name,
  };
  if (suburb) result.suburb = suburb;
  if (a.postcode) result.postcode = a.postcode;
  if (state) result.state = state;
  if (a.house_number) result.houseNumber = a.house_number;
  if (a.city) result.city = a.city;
  return result;
}

/**
 * Pick the candidate that best agrees with what the user typed. OSM treats
 * "Melbourne" or "Sydney" as the whole metro area, so the top free-text hit
 * for "10 Bourke St Melbourne" can be a Bourke St in any suburb.
 */
export function pickBest(
  candidates: GeocodeResult[],
  hints: GeocodeHints,
): GeocodeResult | undefined {
  const eq = (a?: string, b?: string) => !!a && !!b && a.toLowerCase() === b.toLowerCase();
  const score = (c: GeocodeResult) =>
    (eq(c.postcode, hints.postcode) ? 4 : 0) +
    (eq(c.suburb, hints.suburb) ? 3 : 0) +
    (eq(c.houseNumber, hints.houseNumber) ? 1 : 0) +
    (hints.state && c.state && c.state !== hints.state ? -5 : 0) +
    // A capital city's CBD often has no `suburb` in OSM, only `city`.
    (!c.suburb && eq(c.city, hints.suburb) ? 2 : 0);
  let best: GeocodeResult | undefined;
  let bestScore = Number.NEGATIVE_INFINITY;
  for (const c of candidates) {
    const s = score(c);
    if (s > bestScore) [best, bestScore] = [c, s];
  }
  return best;
}
