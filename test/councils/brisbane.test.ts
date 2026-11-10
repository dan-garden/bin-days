import { describe, expect, it } from 'vitest';
import { parseAustralianAddress } from '../../src/core/address.js';
import type { BinDaysError } from '../../src/core/errors.js';
import { brisbane } from '../../src/councils/qld/brisbane.js';
import { ctx, fakeHttp, json } from '../helpers.js';

const record = (over: Record<string, unknown>) => ({
  property_id: '1',
  unit_number: null,
  house_number: '35',
  house_number_suffix: null,
  street_name: 'PEEL ST',
  suburb: 'SOUTH BRISBANE',
  collection_day: 'THURSDAY',
  next_red_bin: '2026-11-12',
  next_yellow_bin: '2026-11-19',
  next_green_bin: '2026-11-12',
  ...over,
});

const records = [
  record({ property_id: 'unit-201', unit_number: '201' }),
  record({ property_id: 'suffix-a', house_number_suffix: 'A' }),
  record({ property_id: 'whole' }),
  record({ property_id: 'other-street', street_name: 'PEELING ST' }),
];

// Like the real portal, only return records in the suburb the query asks for.
function setup(all = records) {
  return fakeHttp((url) => {
    if (url.pathname.endsWith('/bin-collection-calendar/records')) {
      const suburb = /suburb="([^"]+)"/.exec(url.searchParams.get('where') ?? '')?.[1];
      const results = all.filter((r) => !suburb || r.suburb === suburb);
      return json({ total_count: results.length, results });
    }
  });
}

const lookup = (input: string, http = setup()) =>
  brisbane.getSchedule({ input, parts: parseAustralianAddress(input) }, ctx(http));

describe('Brisbane adapter', () => {
  it('queries the open dataset by number, street and suburb', async () => {
    const http = setup();
    await lookup('35 Peel Street, South Brisbane QLD 4101', http);
    expect(http.calls[0]?.searchParams.get('where')).toBe(
      'house_number="35" and street_name like "PEEL%" and suburb="SOUTH BRISBANE"',
    );
  });

  it('prefers the whole property over units, and builds the three services', async () => {
    const schedule = await lookup('35 Peel St South Brisbane');
    expect(schedule.propertyId).toBe('whole');
    expect(schedule.matchedAddress).toBe('35 PEEL ST, SOUTH BRISBANE QLD');
    expect(schedule.services).toEqual([
      expect.objectContaining({
        type: 'general',
        recurrence: { kind: 'interval', everyDays: 7, anchor: '2026-11-12' },
      }),
      expect.objectContaining({
        type: 'recycling',
        recurrence: { kind: 'interval', everyDays: 14, anchor: '2026-11-19' },
      }),
      expect.objectContaining({ type: 'organics', optional: true }),
    ]);
  });

  it('matches units and suffixes exactly', async () => {
    expect((await lookup('201/35 Peel St South Brisbane')).propertyId).toBe('unit-201');
    expect((await lookup('35A Peel St South Brisbane')).propertyId).toBe('suffix-a');
  });

  it('escapes quotes in user input', async () => {
    const http = setup();
    await lookup('35 Pe"el St South Brisbane', http).catch(() => {});
    expect(http.calls[0]?.searchParams.get('where')).toContain('like "PE\\"EL%"');
  });

  it('finds the property when the suburb is wrong but the street is unambiguous', async () => {
    const schedule = await lookup('35 Peel St, West End');
    expect(schedule.matchedAddress).toBe('35 PEEL ST, SOUTH BRISBANE QLD');
  });

  it('does not swap the street type when the suburb is wrong', async () => {
    const error = await lookup('35 Peel Tce, West End').catch((e: unknown) => e);
    expect(error).toMatchObject({ code: 'ADDRESS_NOT_FOUND' });
    expect((error as BinDaysError).details?.suggestions).toContain(
      '35 PEEL ST, SOUTH BRISBANE QLD',
    );
  });

  it('suggests rather than guesses when a wrong suburb leaves several streets', async () => {
    const http = setup([...records, record({ suburb: 'NUNDAH' })]);
    const error = await lookup('35 Peel St, West End', http).catch((e: unknown) => e);
    expect(error).toMatchObject({ code: 'ADDRESS_NOT_FOUND' });
    expect((error as BinDaysError).details?.suggestions).toContain('35 PEEL ST, NUNDAH QLD');
  });
});
