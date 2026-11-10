import { describe, expect, it } from 'vitest';
import { parseAustralianAddress } from '../../src/core/address.js';
import { joondalup } from '../../src/councils/wa/joondalup.js';
import { ctx, fakeHttp, json } from '../helpers.js';

// Real responses from joondalup.wa.gov.au, fetched 2026-11-10.
const property = {
  formatted_address: '212 Trappers Drive WOODVALE WA 6026',
  house_no: 212,
  unit_no: null,
  street: 'Trappers Drive',
  locality: 'WOODVALE',
  mapkey: '1064978',
};
const dates = {
  Rubbish_Day: 'Thursday ',
  Next_Recycling_Date_CustomValue: '2026-11-12T00:00:00',
  Bulk_Rubbish_Pick_Up_CustomValue: '2026-09-07T00:00:00',
};

const setup = () =>
  fakeHttp((url) => {
    if (url.pathname.includes('/propertylookup/')) {
      return json([{ ...property, house_no: 12, mapkey: '1' }, property]);
    }
    if (url.pathname.endsWith('/bindatelookup/1064978')) return json([dates]);
  });

describe('Joondalup adapter', () => {
  it('finds the property, then reads its rubbish day and dates', async () => {
    const http = setup();
    const input = '212 Trappers Dr, Woodvale WA 6026';
    const schedule = await joondalup.getSchedule(
      { input, parts: parseAustralianAddress(input) },
      ctx(http),
    );
    expect(decodeURIComponent(http.calls[0]?.pathname ?? '')).toBe(
      '/aapi/coj/propertylookup/212 Trappers Drive',
    );
    expect(schedule.matchedAddress).toBe('212 Trappers Drive WOODVALE WA 6026');
    expect(schedule.services.map((s) => [s.type, s.recurrence])).toEqual([
      ['general', { kind: 'interval', everyDays: 7, anchor: '2026-11-12' }],
      ['recycling', { kind: 'interval', everyDays: 14, anchor: '2026-11-12' }],
      ['bulky', { kind: 'dates', dates: ['2026-09-07'] }],
    ]);
  });

  it('reports a house number the council does not list', async () => {
    const input = '99 Trappers Drive, Woodvale WA';
    await expect(
      joondalup.getSchedule({ input, parts: parseAustralianAddress(input) }, ctx(setup())),
    ).rejects.toMatchObject({ code: 'ADDRESS_NOT_FOUND' });
  });
});
