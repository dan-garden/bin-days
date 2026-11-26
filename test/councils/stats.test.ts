import { describe, expect, it } from 'vitest';
import type { CouncilBin } from '../../src/councils/bins.js';
import { ALL_COUNCILS } from '../../src/councils/index.js';
import {
  binStats,
  colourOf,
  FREQUENCIES,
  frequencyOf,
  takesFood,
} from '../../src/councils/stats.js';

describe('binStats', () => {
  const stats = binStats();

  it('counts every council once, and every bin it has once', () => {
    expect(stats.councils).toBe(ALL_COUNCILS.length);
    for (const bin of Object.values(stats.bins)) {
      const byFrequency = FREQUENCIES.reduce((sum, f) => sum + bin.frequency[f], 0);
      const byColour = Object.values(bin.colours).reduce((sum, n) => sum + n, 0);
      expect(byFrequency).toBe(bin.councils);
      expect(byColour).toBe(bin.councils);
      expect(bin.councils).toBeLessThanOrEqual(stats.councils);
    }
    expect(stats.states.reduce((sum, state) => sum + state.councils, 0)).toBe(stats.councils);
    expect(Object.values(stats.binsPerCouncil).reduce((sum, n) => sum + n, 0)).toBe(stats.councils);
  });

  it('agrees with itself by state', () => {
    const sum = (key: 'fogo' | 'glass' | 'organics') =>
      stats.states.reduce((total, state) => total + state[key], 0);
    expect(sum('fogo')).toBe(stats.fogo);
    expect(sum('glass')).toBe(stats.bins.glass.councils);
    expect(sum('organics')).toBe(stats.bins.organics.councils);
  });
});

describe('a bin', () => {
  const bin = (
    frequency: CouncilBin['frequency'],
    colour?: string,
    name = 'Organics',
  ): CouncilBin => ({
    type: 'organics',
    name,
    frequency,
    ...(colour ? { colour } : {}),
  });

  it('falls into a group by how often', () => {
    expect(frequencyOf(bin('weekly'))).toBe('weekly');
    expect(frequencyOf(bin('every 28 days'))).toBe('every 4 weeks');
    expect(frequencyOf(bin('irregular'))).toBe('other');
  });

  it('has a lid colour only when the council names one', () => {
    expect(colourOf(bin('weekly', 'lime'))).toBe('lime');
    expect(colourOf(bin('weekly', 'refuse'))).toBe('not stated');
    expect(colourOf(bin('weekly'))).toBe('not stated');
  });

  it('takes food scraps when it says so', () => {
    expect(takesFood(bin('weekly', 'lime', 'FOGO'))).toBe(true);
    expect(takesFood(bin('weekly', 'lime', 'Food and garden'))).toBe(true);
    expect(takesFood(bin('weekly', 'lime', 'Garden waste'))).toBe(false);
  });
});
