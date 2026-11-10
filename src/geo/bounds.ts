/** Small geometry helpers for GeoJSON coordinates. No dependencies, so the web UI can bundle them. */

/** `[west, south, east, north]` */
export type Bounds = [number, number, number, number];

/** The bounding box of any GeoJSON coordinates, however deeply nested. */
export function boundsOf(coordinates: unknown, bounds?: Bounds): Bounds | undefined {
  if (!Array.isArray(coordinates)) return bounds;
  const [x, y] = coordinates;
  if (typeof x === 'number' && typeof y === 'number') {
    return bounds
      ? [
          Math.min(bounds[0], x),
          Math.min(bounds[1], y),
          Math.max(bounds[2], x),
          Math.max(bounds[3], y),
        ]
      : [x, y, x, y];
  }
  return coordinates.reduce<Bounds | undefined>((acc, part) => boundsOf(part, acc), bounds);
}

/** The middle of a bounding box, as `[longitude, latitude]`. */
export const centreOf = (bounds: Bounds): [number, number] => [
  (bounds[0] + bounds[2]) / 2,
  (bounds[1] + bounds[3]) / 2,
];

/** Rough distance in kilometres between two `[longitude, latitude]` points. Fine for ranking neighbours. */
export function distanceKm(a: [number, number], b: [number, number]): number {
  const toRadians = Math.PI / 180;
  const x = (b[0] - a[0]) * toRadians * Math.cos(((a[1] + b[1]) / 2) * toRadians);
  const y = (b[1] - a[1]) * toRadians;
  return Math.hypot(x, y) * 6371;
}
