import { describe, expect, it } from 'vitest';
import { parseAustralianAddress } from '../../src/core/address.js';
import { belmont } from '../../src/councils/wa/belmont.js';
import { ctx, fakeHttp, json } from '../helpers.js';

// Shapes as belmont.wa.gov.au returned them on 2026-11-10.
const properties = [
  { mapkey: 168824, dbkey: 192851, Address: '12 Wheatley Street Kewdale 6105' },
  { mapkey: 1, dbkey: 2, Address: '112 Wheatley Street Kewdale 6105' },
];
const details = {
  BinDayGeneralWasteFormatted: '2026-11-10T00:00:00',
  BinDayRecyclingFormatted: '2026-11-17T00:00:00',
  BinDayFOGOFormatted: '0001-01-01T00:00:00',
};

describe('Belmont adapter', () => {
  it("finds the property and gives each bin's next date", async () => {
    const http = fakeHttp((url) =>
      url.pathname.endsWith('/getaddresses') ? json(properties) : json({ data: details }),
    );
    const input = '12 Wheatley St, Kewdale WA';
    const schedule = await belmont.getSchedule(
      { input, parts: parseAustralianAddress(input) },
      ctx(http),
    );
    expect(http.calls[0]?.searchParams.get('key')).toBe('12 Wheatley Street');
    expect(http.calls[1]?.searchParams.get('dbkey')).toBe('192851');
    // No cycle is given, and a bin the property doesn't have is left out.
    expect(schedule.services.map((s) => [s.type, s.recurrence])).toEqual([
      ['general', { kind: 'dates', dates: ['2026-11-10'] }],
      ['recycling', { kind: 'dates', dates: ['2026-11-17'] }],
    ]);
  });
});
