import { describe, expect, it } from 'vitest';
import { binsFor } from '../../src/councils/nsw/canterbury-bankstown.js';
import { d } from '../helpers.js';

const row = {
  fullAddress: '32 Example Avenue, Revesby 2212',
  address: '32 Example Avenue',
  tab: '1',
  redServiceDay: 'Wednesday',
  redServiceDay2: null,
  redServiceDay3: null,
  yellowServiceDay: 'Wednesday',
  greenServiceDay: null,
  zone: 'A',
  yellowZone: null,
};
const bins = (changes: Partial<typeof row>) =>
  binsFor({ ...row, ...changes }, d('2026-11-10')).map((s) => [s.name, s.recurrence]);

describe("Canterbury Bankstown's collection patterns", () => {
  it('alternates recycling and garden for a house, by its area', () => {
    // The week of 9 November 2026 is one of area A's recycling weeks in the Bin Day Finder.
    expect(bins({})).toEqual([
      ['General waste', { kind: 'interval', everyDays: 7, anchor: '2026-11-11' }],
      ['Recycling', { kind: 'interval', everyDays: 14, anchor: '2021-03-10' }],
      ['Garden organics', { kind: 'interval', everyDays: 14, anchor: '2021-03-17' }],
    ]);
    expect(bins({ zone: 'B' }).map(([, r]) => r.kind === 'interval' && r.anchor)).toEqual([
      '2026-11-11',
      '2021-03-17',
      '2021-03-10',
    ]);
  });

  it('collects a building twice a week, with its garden bin on another day', () => {
    expect(
      bins({ tab: '2a', redServiceDay2: 'Friday', greenServiceDay: 'Tuesday' }).map(([name, r]) => [
        name,
        r.kind === 'interval' && [r.everyDays, r.anchor],
      ]),
    ).toEqual([
      ['General waste (Wednesday)', [7, '2026-11-11']],
      ['General waste (Friday)', [7, '2026-11-13']],
      ['Recycling (Wednesday)', [7, '2026-11-11']],
      ['Recycling (Friday)', [7, '2026-11-13']],
      ['Garden organics', [14, '2021-03-16']],
    ]);
  });

  it('gives recycling its own day and area where the pattern has them', () => {
    const own = { tab: '2c', yellowServiceDay: 'Monday', greenServiceDay: 'Thursday' };
    expect(bins({ ...own, yellowZone: 'B' })[1]).toEqual([
      'Recycling',
      { kind: 'interval', everyDays: 14, anchor: '2021-03-15' },
    ]);
    expect(bins({ ...own, yellowZone: 'Weekly' })[1]).toEqual([
      'Recycling',
      { kind: 'interval', everyDays: 7, anchor: '2026-11-16' },
    ]);
    // Pattern 2b: recycling on the garden bin's day, in the area's own weeks.
    expect(bins({ tab: '2b', greenServiceDay: 'Thursday' }).slice(1)).toEqual([
      ['Recycling', { kind: 'interval', everyDays: 14, anchor: '2021-03-11' }],
      ['Garden organics', { kind: 'interval', everyDays: 14, anchor: '2021-03-18' }],
    ]);
  });
});
