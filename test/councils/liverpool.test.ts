import { describe, expect, it } from 'vitest';
import { parseAustralianAddress } from '../../src/core/address.js';
import { liverpool } from '../../src/councils/nsw/liverpool.js';
import { ctx, fakeHttp, json } from '../helpers.js';

const record = (gisaddress: string) => ({
  gisaddress,
  garbagebin_week1: '2025-07-01',
  garbagebin_schedule: 7,
  recyclebin_week1: '2025-07-08',
  recyclebin_schedule: 14,
  organicbin_week1: null,
  organicbin_schedule: null,
});

function setup(...addresses: string[]) {
  return fakeHttp((url) => {
    if (url.pathname.endsWith('/bin-collection-days/records')) {
      return json({ total_count: addresses.length, results: addresses.map(record) });
    }
  });
}

const lookup = (input: string, http: ReturnType<typeof setup>) =>
  liverpool.getSchedule({ input, parts: parseAustralianAddress(input) }, ctx(http));

describe('Liverpool adapter', () => {
  it('queries by address prefix and builds services from the cycle fields', async () => {
    const http = setup('65 MEMORIAL AVENUE LIVERPOOL  NSW  2170');
    const schedule = await lookup('65 Memorial Ave, Liverpool NSW 2170', http);
    expect(http.calls[0]?.searchParams.get('where')).toBe('startswith(gisaddress, "65 MEMORIAL ")');
    expect(schedule.matchedAddress).toBe('65 MEMORIAL AVENUE LIVERPOOL NSW 2170');
    expect(schedule.services).toEqual([
      expect.objectContaining({
        type: 'general',
        recurrence: { kind: 'interval', everyDays: 7, anchor: '2025-07-01' },
      }),
      expect.objectContaining({
        type: 'recycling',
        recurrence: { kind: 'interval', everyDays: 14, anchor: '2025-07-08' },
      }),
    ]);
  });

  it('looks units up in both of the formats the dataset uses', async () => {
    const http = setup('1/ 65 MEMORIAL AVENUE LIVERPOOL  NSW  2170');
    const schedule = await lookup('1/65 Memorial Avenue Liverpool', http);
    expect(http.calls[0]?.searchParams.get('where')).toBe(
      'startswith(gisaddress, "1/ 65 MEMORIAL ") or startswith(gisaddress, "UNIT 1/ 65 MEMORIAL ")',
    );
    expect(schedule.matchedAddress).toBe('1/65 MEMORIAL AVENUE LIVERPOOL NSW 2170');
  });

  it('forgives a wrong suburb only when the street is unambiguous', async () => {
    const casula = '5 SMITH STREET CASULA  NSW  2170';
    const lurnea = '5 SMITH STREET LURNEA  NSW  2170';
    const one = await lookup('5 Smith St, Prestons', setup(casula));
    expect(one.matchedAddress).toBe('5 SMITH STREET CASULA NSW 2170');
    expect((await lookup('5 Smith St, Lurnea', setup(casula, lurnea))).matchedAddress).toContain(
      'LURNEA',
    );
    await expect(lookup('5 Smith St, Prestons', setup(casula, lurnea))).rejects.toMatchObject({
      code: 'ADDRESS_NOT_FOUND',
      details: { suggestions: [casula, lurnea].map((a) => a.replace(/\s+/g, ' ')) },
    });
    await expect(lookup('5 Smith Road, Casula', setup(casula))).rejects.toMatchObject({
      code: 'ADDRESS_NOT_FOUND',
    });
  });
});
