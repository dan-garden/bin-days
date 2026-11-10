import { describe, expect, it } from 'vitest';
import {
  boundsOf,
  daysUntil,
  formatDate,
  groupByState,
  lidPaint,
  relativeDay,
} from '../../web/src/lib.js';

describe('web UI helpers', () => {
  it('counts and words the days to a collection', () => {
    expect(daysUntil('2026-11-13', '2026-11-10')).toBe(3);
    expect(daysUntil('2027-01-02', '2026-12-30')).toBe(3);
    expect(relativeDay('2026-11-10', '2026-11-10')).toBe('Today');
    expect(relativeDay('2026-11-11', '2026-11-10')).toBe('Tomorrow');
    expect(relativeDay('2026-11-13', '2026-11-10')).toBe('In 3 days');
  });

  it('formats a date without shifting the calendar day', () => {
    expect(formatDate('2026-11-13', { weekday: 'long', day: 'numeric', month: 'long' })).toBe(
      'Friday 13 November',
    );
  });

  it("paints a lid in the council's colour, else the usual one for the type", () => {
    expect(lidPaint({ type: 'general', colour: 'red' })).toBe('#e03131');
    expect(lidPaint({ type: 'recycling', colour: 'blue' })).toBe('#228be6'); // paper bins
    expect(lidPaint({ type: 'glass' })).toBe('#9c36b5');
    expect(lidPaint({ type: 'bulky' })).toBe('#868e96');
    expect(lidPaint({ type: 'other', colour: 'teal' })).toBe('#868e96');
  });

  it('groups councils by state, biggest state first, names in order', () => {
    const councils = [
      { state: 'QLD', name: 'Redland' },
      { state: 'NSW', name: 'Penrith' },
      { state: 'QLD', name: 'Brisbane' },
    ] as const;
    expect(groupByState(councils).map(([s, list]) => [s, list.map((c) => c.name)])).toEqual([
      ['QLD', ['Brisbane', 'Redland']],
      ['NSW', ['Penrith']],
    ]);
  });

  it('finds the bounding box of polygons and multipolygons', () => {
    const polygon = [
      [
        [153, -28],
        [154, -27.5],
        [153.5, -27],
      ],
    ];
    expect(boundsOf(polygon)).toEqual([153, -28, 154, -27]);
    expect(
      boundsOf([
        polygon,
        [
          [
            [150, -34],
            [151, -33],
          ],
        ],
      ]),
    ).toEqual([150, -34, 154, -27]);
    expect(boundsOf([])).toBeUndefined();
  });
});
