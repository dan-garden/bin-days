import { describe, expect, it } from 'vitest';
import { parseAustralianAddress } from '../../src/core/address.js';
import { casey } from '../../src/councils/vic/casey.js';
import { ctx, fakeHttp, json } from '../helpers.js';

// A real property from casey.vic.gov.au, fetched 2026-11-10.
const property = {
  full_address: '2 Patrick Northeast Drive NARRE WARREN VIC 3805',
  NextGarbageDate: '2026-11-16',
  NextRecycleDate: '2026-11-16',
  NextGardenDate: '2026-11-23',
  NextGlassDate: '2026-11-09',
  Rubbish: 'Fortnightly on Monday;Past:  2 November, 9 November;Next:  16 November, 23 November',
  Recycling: 'Fortnightly on Monday;Past:  19 October, 2 November;Next:  16 November, 30 November',
  Garden: 'Fortnightly on Monday;Past:  26 October, 9 November;Next:  23 November, 7 December',
  Glass:
    'Starting in November;Monthly on Monday;1st Collection: 9 November;2nd Collection: 7 December',
};

const lookup = (input: string, result: unknown[]) => {
  const http = fakeHttp(() => json({ result }));
  return {
    http,
    schedule: casey.getSchedule({ input, parts: parseAustralianAddress(input) }, ctx(http)),
  };
};

describe('Casey adapter', () => {
  it("reads each bin's next date, and its cycle from the dates the council lists", async () => {
    const { http, schedule } = lookup('2 Patrick Northeast Dr, Narre Warren VIC 3805', [property]);
    expect(http.calls[0]?.searchParams.get('term')).toBe('2 Patrick Northeast Drive');
    expect((await schedule).services.map((s) => [s.type, s.recurrence])).toEqual([
      // Described as fortnightly, but the dates listed are a week apart.
      ['general', { kind: 'interval', everyDays: 7, anchor: '2026-11-16' }],
      ['recycling', { kind: 'interval', everyDays: 14, anchor: '2026-11-16' }],
      ['organics', { kind: 'interval', everyDays: 14, anchor: '2026-11-23' }],
      ['glass', { kind: 'interval', everyDays: 28, anchor: '2026-11-09' }],
    ]);
  });

  it('suggests rather than guesses between two suburbs', async () => {
    const other = { ...property, full_address: '2 Patrick Northeast Drive BERWICK VIC 3806' };
    await expect(
      lookup('2 Patrick Northeast Drive, Cranbourne VIC', [property, other]).schedule,
    ).rejects.toMatchObject({ code: 'ADDRESS_NOT_FOUND' });
    const picked = await lookup('2 Patrick Northeast Drive, Berwick VIC', [property, other])
      .schedule;
    expect(picked.matchedAddress).toContain('BERWICK');
  });
});
