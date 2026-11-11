/** A GeoJSON polygon or multi-polygon, with positions as `[longitude, latitude]`. */
export type Area =
  | { type: 'Polygon'; coordinates: number[][][] }
  | { type: 'MultiPolygon'; coordinates: number[][][][] };

/** Whether a ring encloses the point: count the edges a line running east from it crosses. */
function inRing(ring: number[][], x: number, y: number): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i] as [number, number];
    const [xj, yj] = ring[j] as [number, number];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Whether the point is inside the area. A polygon's first ring is its outline, the rest holes. */
export function areaContains(area: Area, point: { latitude: number; longitude: number }): boolean {
  const polygons = area.type === 'Polygon' ? [area.coordinates] : area.coordinates;
  return polygons.some(
    ([outline, ...holes]) =>
      !!outline &&
      inRing(outline, point.longitude, point.latitude) &&
      !holes.some((hole) => inRing(hole, point.longitude, point.latitude)),
  );
}
