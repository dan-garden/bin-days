import { describe, expect, it } from 'vitest';
import { formatStreetLine, parseAustralianAddress } from '../../src/core/address.js';
import { classifyBin } from '../../src/core/bin-types.js';

describe('parseAustralianAddress', () => {
  it.each([
    [
      '12 Example Road, Testville QLD 4000, Australia',
      {
        houseNumber: '12',
        streetName: 'Example',
        streetType: 'Road',
        street: 'Example Road',
        suburb: 'Testville',
        state: 'QLD',
        postcode: '4000',
      },
    ],
    [
      '12 example rd testville',
      {
        houseNumber: '12',
        streetName: 'Example',
        streetType: 'Road',
        street: 'Example Road',
        suburb: 'Testville',
      },
    ],
    [
      '2/35A Peel St, South Brisbane, Queensland',
      {
        unit: '2',
        houseNumber: '35A',
        streetName: 'Peel',
        streetType: 'Street',
        street: 'Peel Street',
        suburb: 'South Brisbane',
        state: 'QLD',
      },
    ],
    [
      'Unit 4, 10 Smith Street Surfers Paradise',
      {
        unit: '4',
        houseNumber: '10',
        streetName: 'Smith',
        streetType: 'Street',
        street: 'Smith Street',
        suburb: 'Surfers Paradise',
      },
    ],
    [
      '12 The Esplanade, Surfers Paradise',
      {
        houseNumber: '12',
        streetName: 'The',
        streetType: 'Esplanade',
        street: 'The Esplanade',
        suburb: 'Surfers Paradise',
      },
    ],
    [
      '5 Mount Cotton Rd Capalaba QLD',
      {
        houseNumber: '5',
        streetName: 'Mount Cotton',
        streetType: 'Road',
        street: 'Mount Cotton Road',
        suburb: 'Capalaba',
        state: 'QLD',
      },
    ],
    [
      '1 Martin Place Sydney NSW 2000',
      {
        houseNumber: '1',
        streetName: 'Martin',
        streetType: 'Place',
        street: 'Martin Place',
        suburb: 'Sydney',
        state: 'NSW',
        postcode: '2000',
      },
    ],
  ])('parses "%s"', (input, expected) => {
    expect(parseAustralianAddress(input)).toEqual(expected);
  });

  it('formats street lines in full or abbreviated', () => {
    const parts = parseAustralianAddress('2/35 Peel Street South Brisbane');
    expect(formatStreetLine(parts)).toBe('35 Peel Street');
    expect(formatStreetLine(parts, { abbreviate: true })).toBe('35 Peel St');
    expect(formatStreetLine(parts, { includeUnit: true })).toBe('2/35 Peel Street');
  });
});

describe('classifyBin', () => {
  it.each([
    ['General waste', 'general'],
    ['Red lid bin', 'general'],
    ['Rubbish', 'general'],
    ['Recycling', 'recycling'],
    ['Yellow lid recycling', 'recycling'],
    ['Green organics', 'organics'],
    ['Garden Organics (green lid)', 'organics'],
    ['FOGO', 'organics'],
    ['Glass', 'glass'],
    ['Food waste caddy', 'food'],
    ['Kerbside large item collection', 'bulky'],
    ['Mystery bin', 'other'],
  ])('%s -> %s', (label, type) => {
    expect(classifyBin(label)).toBe(type);
  });

  it('honours council overrides', () => {
    expect(classifyBin('Green bin', { 'green bin': 'general' })).toBe('general');
  });
});
