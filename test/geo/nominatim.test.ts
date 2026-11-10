import { describe, expect, it } from 'vitest';
import { pickBest } from '../../src/geo/nominatim.js';
import type { GeocodeResult } from '../../src/geo/types.js';

const c = (formatted: string, extra: Partial<GeocodeResult>): GeocodeResult => ({
  latitude: 0,
  longitude: 0,
  formatted,
  ...extra,
});

// Real ordering Nominatim returned for "10 Bourke Street, Melbourne VIC".
const candidates = [
  c('10 Bourke St, Mentone', { suburb: 'Mentone', city: 'Melbourne', postcode: '3194' }),
  c('10 Bourke St, Coburg', { suburb: 'Coburg', city: 'Melbourne', postcode: '3058' }),
  c('10 Bourke St, Melbourne 3000', { city: 'Melbourne', postcode: '3000', houseNumber: '10' }),
];

describe('pickBest', () => {
  it('prefers a matching postcode', () => {
    expect(pickBest(candidates, { postcode: '3058' })?.formatted).toContain('Coburg');
  });

  it('matches a CBD that only has a city, not a suburb', () => {
    expect(pickBest(candidates, { suburb: 'Melbourne', houseNumber: '10' })?.formatted).toContain(
      '3000',
    );
  });

  it('prefers an exact suburb match', () => {
    expect(pickBest(candidates, { suburb: 'mentone' })?.formatted).toContain('Mentone');
  });

  it('keeps the geocoder order with no hints', () => {
    expect(pickBest(candidates, {})?.formatted).toContain('Mentone');
    expect(pickBest([], {})).toBeUndefined();
  });

  it('penalises the wrong state', () => {
    const results = [
      c('Smith St, NSW', { state: 'NSW', suburb: 'Kingston' }),
      c('Smith St, TAS', { state: 'TAS', suburb: 'Kingston' }),
    ];
    expect(pickBest(results, { suburb: 'Kingston', state: 'TAS' })?.state).toBe('TAS');
  });
});
