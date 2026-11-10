import { describe, expect, it } from 'vitest';
import { parseAustralianAddress } from '../../src/core/address.js';
import { canberra } from '../../src/councils/act/canberra.js';
import { ctx, fakeHttp, json } from '../helpers.js';

// A real row from data.act.gov.au, fetched 2026-11-10.
const acton = {
  suburb: 'ACTON',
  garbage_collection_frequency: 'Weekly',
  garbage_pickup_date: '13/11/2026',
  recycling_collection_frequency: 'Fortnightly',
  recycling_pickup_date: '20/11/2026',
  greenwaste_collection_frequency: 'Fortnightly',
  next_greenwaste_date: '13/11/2026',
  greenwaste_type: 'Greenwaste',
};

const lookup = (input: string, rows: unknown[]) => {
  const http = fakeHttp(() => json(rows));
  return {
    http,
    result: canberra.getSchedule({ input, parts: parseAustralianAddress(input) }, ctx(http)),
  };
};

describe('Canberra (ACT) adapter', () => {
  it('looks the suburb up and builds the three bins', async () => {
    const { http, result } = lookup('1 Liversidge Street, Acton ACT 2601', [acton]);
    const schedule = await result;
    expect(http.calls[0]?.searchParams.get('suburb')).toBe('ACTON');
    expect(schedule.matchedAddress).toBe('ACTON, ACT');
    expect(schedule.services.map((s) => [s.type, s.recurrence])).toEqual([
      ['general', { kind: 'interval', everyDays: 7, anchor: '2026-11-13' }],
      ['recycling', { kind: 'interval', everyDays: 14, anchor: '2026-11-20' }],
      ['organics', { kind: 'interval', everyDays: 14, anchor: '2026-11-13' }],
    ]);
  });

  it('explains why a split suburb cannot be answered', async () => {
    const rows = [
      { ...acton, suburb: 'DUNLOP', split_suburb: 'North' },
      { ...acton, suburb: 'DUNLOP', split_suburb: 'South' },
    ];
    await expect(lookup('5 Example Street, Dunlop ACT', rows).result).rejects.toMatchObject({
      code: 'ADDRESS_NOT_FOUND',
      message: expect.stringContaining('North, South'),
    });
  });

  it('reports an unknown suburb', async () => {
    await expect(lookup('5 Example Street, Nowhere ACT', []).result).rejects.toMatchObject({
      code: 'ADDRESS_NOT_FOUND',
    });
  });
});
