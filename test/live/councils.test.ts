/**
 * Live smoke tests against real council sites, geocoders and boundary
 * services. Run with `npm run test:live`. Run these when adding a council and
 * on a schedule (e.g. weekly CI) to catch councils redesigning their sites.
 */
import { describe, expect, it } from 'vitest';
import { ALL_COUNCILS } from '../../src/councils/index.js';
import { BinDaysService } from '../../src/service.js';
import { ADDRESSES } from './addresses.js';

/** Addresses that don't exist. These must fail, not match a neighbour. */
const NOT_FOUND = [
  '5 Tallebudgera Drive Palm Beach QLD', // used to match 5 Dudgeon Drive, TALLEBUDGERA
  '2/35 Peel St, South Brisbane QLD 4101',
  '8 Dornoch Terrace, West End', // must not become 8 Dornoch Cres, Ferny Grove
  '40 Oxford Street Hawthorne', // wrong suburb, and two suburbs have a 40 Oxford St
  '4 Abelia Street Capalaba QLD', // wrong suburb, and two Redland suburbs have an Abelia Street
];

const service = new BinDaysService();

describe.each(ALL_COUNCILS.map((c) => [c.id] as const))('%s', (id) => {
  it('has a sample address', () => {
    expect(ADDRESSES[id]?.length).toBeGreaterThan(0);
  });

  it.each(ADDRESSES[id] ?? [])('%s', async (address) => {
    const result = await service.lookup({ address });
    expect(result.council.id).toBe(id);
    // Most sources match a property. Suburb- and zone-based ones only know the locality.
    const { streetName = '', suburb = '' } = result.address.parts;
    expect(result.address.matched.toUpperCase()).toMatch(
      new RegExp(`${streetName}|${suburb}`.toUpperCase()),
    );
    expect(result.services.map((s) => s.type)).toContain('general');
    expect(result.days.length).toBeGreaterThan(0);
  });
});

it.each(NOT_FOUND)('rejects %s', async (address) => {
  await expect(service.lookup({ address })).rejects.toMatchObject({ code: 'ADDRESS_NOT_FOUND' });
});
