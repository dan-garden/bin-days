import { describe, expect, it } from 'vitest';
import {
  collectionsInRange,
  expandRecurrence,
  intervalDays,
  nextCollection,
  parseFrequency,
} from '../../src/core/schedule.js';
import type { BinService } from '../../src/core/types.js';
import { d } from '../helpers.js';

describe('expandRecurrence', () => {
  it('projects an interval forwards from the anchor', () => {
    const r = { kind: 'interval', everyDays: 14, anchor: d('2026-11-13') } as const;
    expect(expandRecurrence(r, d('2026-11-10'), d('2026-12-31'))).toEqual([
      '2026-11-13',
      '2026-11-27',
      '2026-12-11',
      '2026-12-25',
    ]);
  });

  it('projects backwards too, keeping the same phase', () => {
    const r = { kind: 'interval', everyDays: 14, anchor: d('2026-11-13') } as const;
    expect(expandRecurrence(r, d('2026-10-01'), d('2026-10-31'))).toEqual([
      '2026-10-02',
      '2026-10-16',
      '2026-10-30',
    ]);
  });

  it('includes both range ends', () => {
    const r = { kind: 'interval', everyDays: 7, anchor: d('2026-11-13') } as const;
    expect(expandRecurrence(r, d('2026-11-13'), d('2026-11-20'))).toEqual([
      '2026-11-13',
      '2026-11-20',
    ]);
    expect(expandRecurrence(r, d('2026-11-14'), d('2026-11-19'))).toEqual([]);
  });

  it('filters, dedupes and sorts explicit dates', () => {
    const r = {
      kind: 'dates',
      dates: [d('2026-12-01'), d('2026-11-01'), d('2026-12-01')],
    } as const;
    expect(expandRecurrence(r, d('2026-11-15'), d('2026-12-31'))).toEqual(['2026-12-01']);
  });

  it('rejects nonsense intervals', () => {
    const r = { kind: 'interval', everyDays: 0, anchor: d('2026-11-13') } as const;
    expect(() => expandRecurrence(r, d('2026-11-01'), d('2026-11-30'))).toThrow(RangeError);
  });
});

describe('collectionsInRange', () => {
  const services: BinService[] = [
    {
      type: 'general',
      name: 'General',
      recurrence: { kind: 'interval', everyDays: 7, anchor: d('2026-11-13') },
    },
    {
      type: 'recycling',
      name: 'Recycling',
      colour: 'yellow',
      recurrence: { kind: 'interval', everyDays: 14, anchor: d('2026-11-20') },
    },
  ];

  it('merges services, sorted by date, marking confirmed vs projected', () => {
    expect(collectionsInRange(services, d('2026-11-10'), d('2026-11-23'))).toEqual([
      { date: '2026-11-13', type: 'general', name: 'General', confidence: 'confirmed' },
      { date: '2026-11-20', type: 'general', name: 'General', confidence: 'projected' },
      {
        date: '2026-11-20',
        type: 'recycling',
        name: 'Recycling',
        colour: 'yellow',
        confidence: 'confirmed',
      },
    ]);
  });

  it('finds the next collection', () => {
    expect(nextCollection(services[1]!, d('2026-11-21'))).toBe('2026-12-04');
  });
});

describe('intervalDays', () => {
  it('finds the cycle in a date list despite a holiday shift', () => {
    const dates = ['2026-12-11', '2026-12-26', '2027-01-08', '2027-01-22', '2027-02-05'].map(d);
    expect(intervalDays({ kind: 'dates', dates })).toBe(14);
    expect(intervalDays({ kind: 'dates', dates: [d('2026-12-11')] })).toBeUndefined();
    expect(intervalDays({ kind: 'interval', everyDays: 7, anchor: d('2026-12-11') })).toBe(7);
  });
});

describe('parseFrequency', () => {
  it.each([
    ['Collected weekly', 7],
    ['Collected fortnightly', 14],
    ['Every 2 weeks', 14],
    ['every four weeks', 28],
    ['On request', undefined],
  ])('%s -> %s', (text, days) => {
    expect(parseFrequency(text)).toBe(days);
  });
});
