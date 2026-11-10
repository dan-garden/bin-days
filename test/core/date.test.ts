import { describe, expect, it } from 'vitest';
import {
  addDays,
  daysBetween,
  isLocalDate,
  parseAustralianDate,
  secondsUntilMidnight,
  today,
  weekday,
} from '../../src/core/date.js';
import { d } from '../helpers.js';

describe('dates', () => {
  it('validates real calendar dates only', () => {
    expect(isLocalDate('2026-02-28')).toBe(true);
    expect(isLocalDate('2026-02-29')).toBe(false);
    expect(isLocalDate('2028-02-29')).toBe(true);
    expect(isLocalDate('13/11/2026')).toBe(false);
  });

  it('does arithmetic across month and year boundaries', () => {
    expect(addDays(d('2026-12-25'), 14)).toBe('2027-01-08');
    expect(addDays(d('2026-03-01'), -1)).toBe('2026-02-28');
    expect(daysBetween(d('2026-11-10'), d('2026-11-24'))).toBe(14);
    expect(daysBetween(d('2026-11-24'), d('2026-11-10'))).toBe(-14);
  });

  it('is unaffected by DST transitions', () => {
    // Sydney DST starts first Sunday of October.
    expect(addDays(d('2026-10-03'), 1)).toBe('2026-10-04');
    expect(addDays(d('2026-10-04'), 1)).toBe('2026-10-05');
  });

  it('knows the weekday', () => {
    expect(weekday(d('2026-11-13'))).toBe('Friday');
  });

  it("computes today in the council's timezone, not the server's", () => {
    // 15:00 UTC on 10 Nov is already 01:00 on 11 Nov in Brisbane.
    const instant = new Date('2026-11-10T15:00:00Z');
    expect(today('Australia/Brisbane', instant)).toBe('2026-11-11');
    expect(today('Australia/Perth', instant)).toBe('2026-11-10');
  });

  it.each([
    ['Fri 13/11/2026', '2026-11-13'],
    ['13/11/2026', '2026-11-13'],
    ['3/1/2027', '2027-01-03'],
    ['13-11-26', '2026-11-13'],
    ['Friday 13 November 2026', '2026-11-13'],
    ['13th Nov 2026', '2026-11-13'],
    ['2026-11-13', '2026-11-13'],
  ])('parses Australian date "%s"', (input, expected) => {
    expect(parseAustralianDate(input)).toBe(expected);
  });

  it('rejects impossible dates', () => {
    expect(parseAustralianDate('31/02/2026')).toBeUndefined();
    expect(parseAustralianDate('no date here')).toBeUndefined();
  });

  it('counts the seconds left in the day in a timezone', () => {
    const middayInBrisbane = new Date('2026-11-10T02:00:00Z');
    expect(secondsUntilMidnight('Australia/Brisbane', middayInBrisbane)).toBe(12 * 3600);
    // Sydney is an hour ahead in November (daylight saving).
    expect(secondsUntilMidnight('Australia/Sydney', middayInBrisbane)).toBe(11 * 3600);
    // Never zero, so it is always usable as a cache lifetime.
    expect(secondsUntilMidnight('Australia/Brisbane', new Date('2026-11-10T13:59:59Z'))).toBe(60);
  });
});
