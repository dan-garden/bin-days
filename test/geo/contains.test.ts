import { describe, expect, it } from 'vitest';
import { type Area, areaContains } from '../../src/geo/contains.js';

const square = (x: number, y: number, size: number) => [
  [x, y],
  [x + size, y],
  [x + size, y + size],
  [x, y + size],
  [x, y],
];
const at = (longitude: number, latitude: number) => ({ longitude, latitude });

describe('areaContains', () => {
  it('finds a point inside a polygon, but not in its hole', () => {
    const area: Area = { type: 'Polygon', coordinates: [square(0, 0, 10), square(4, 4, 2)] };
    expect(areaContains(area, at(1, 1))).toBe(true);
    expect(areaContains(area, at(5, 5))).toBe(false);
    expect(areaContains(area, at(11, 1))).toBe(false);
  });

  it('checks every part of a multi-polygon', () => {
    const area: Area = {
      type: 'MultiPolygon',
      coordinates: [[square(0, 0, 1)], [square(144, -38, 1)]],
    };
    expect(areaContains(area, at(144.5, -37.5))).toBe(true);
    expect(areaContains(area, at(143.5, -37.5))).toBe(false);
  });
});
