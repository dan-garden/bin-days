import { describe, expect, it } from 'vitest';
import { easterSunday, KONAMI_LENGTH, konami, season } from '../../web/src/secrets/catalogue.js';

describe('easterSunday', () => {
  it('matches known dates', () => {
    expect(easterSunday(2025)).toEqual([4, 20]);
    expect(easterSunday(2026)).toEqual([4, 5]);
    expect(easterSunday(2027)).toEqual([3, 28]);
    expect(easterSunday(2038)).toEqual([4, 25]);
  });
});

describe('season', () => {
  it('runs Easter from Good Friday to Easter Monday', () => {
    expect(season(new Date(2026, 3, 2))).toBeUndefined();
    expect(season(new Date(2026, 3, 3))).toBe('easter');
    expect(season(new Date(2026, 3, 6))).toBe('easter');
    expect(season(new Date(2026, 3, 7))).toBeUndefined();
  });

  it('knows the other occasions', () => {
    expect(season(new Date(2026, 11, 19))).toBeUndefined();
    expect(season(new Date(2026, 11, 25))).toBe('christmas');
    expect(season(new Date(2026, 9, 31))).toBe('halloween');
    expect(season(new Date(2027, 0, 1))).toBe('newyear');
    expect(season(new Date(2026, 10, 26))).toBeUndefined();
  });
});

describe('konami', () => {
  const type = (keys: string[]) => keys.reduce(konami, 0);
  const code = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'B',
    'a',
  ];

  it('completes on the whole code', () => expect(type(code)).toBe(KONAMI_LENGTH));
  it('survives an extra Up at the start', () =>
    expect(type(['ArrowUp', ...code])).toBe(KONAMI_LENGTH));
  it('starts again after a wrong key', () =>
    expect(type(['ArrowUp', 'x', ...code.slice(0, 3)])).toBe(3));
});
