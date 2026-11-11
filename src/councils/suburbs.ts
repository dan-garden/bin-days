import { distanceKm } from '../geo/bounds.js';
import { suburbSlug } from './names.js';
import { SUBURBS } from './suburbs.generated.js';

/** A suburb in a council's area, with the middle of it for the map. */
export interface Suburb {
  name: string;
  latitude: number;
  longitude: number;
}

/** The suburbs in a council's area, in alphabetical order. None for a council not in the list. */
export function suburbsOf(councilId: string): Suburb[] {
  return (SUBURBS[councilId] ?? []).map(([name, latitude, longitude]) => ({
    name,
    latitude,
    longitude,
  }));
}

/** The suburb a page address names, e.g. `mount-kuring-gai`. */
export function findSuburb(councilId: string, slug: string): Suburb | undefined {
  return suburbsOf(councilId).find((suburb) => suburbSlug(suburb.name) === slug.toLowerCase());
}

/** The closest other suburbs in the same council, nearest first. */
export function nearestSuburbs(councilId: string, suburb: Suburb, count: number): Suburb[] {
  const from = (s: Suburb) =>
    distanceKm([suburb.longitude, suburb.latitude], [s.longitude, s.latitude]);
  return suburbsOf(councilId)
    .filter((other) => other.name !== suburb.name)
    .sort((a, b) => from(a) - from(b))
    .slice(0, count);
}
