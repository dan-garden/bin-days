import type { AustralianState } from '../core/types.js';

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formatted: string;
  suburb?: string;
  postcode?: string;
  state?: AustralianState;
  houseNumber?: string;
  /** For OSM this is often the metro area, e.g. "Melbourne". */
  city?: string;
}

/** What the user typed, used to choose between ambiguous candidates. */
export interface GeocodeHints {
  houseNumber?: string;
  suburb?: string;
  postcode?: string;
  state?: AustralianState;
}

/** Turns free-text Australian addresses into coordinates. */
export interface Geocoder {
  geocode(address: string, hints?: GeocodeHints): Promise<GeocodeResult | undefined>;
}

export interface Lga {
  code: string;
  name: string;
  state?: AustralianState;
}

/** The outline of one Local Government Area. */
export interface LgaBoundary {
  code: string;
  /** A GeoJSON `Polygon` or `MultiPolygon` in WGS84 (longitude, latitude). */
  geometry: { type: string; coordinates: unknown };
}

/** Finds the Local Government Area containing a point, and draws LGAs. */
export interface LgaResolver {
  lookup(latitude: number, longitude: number): Promise<Lga | undefined>;
  /** Simplified outlines of the given LGAs, for maps. Unknown codes are left out. */
  boundaries(codes: readonly string[]): Promise<LgaBoundary[]>;
}
