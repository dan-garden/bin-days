import { describe, expect, it } from 'vitest';
import { knox } from '../../src/councils/vic/knox.js';
import { ctx, fakeHttp, json, recurrences, resolved } from '../helpers.js';

describe('Knox adapter', () => {
  it("finds the property and gives each bin's next date and cycle", async () => {
    // Shapes as knox.vic.gov.au returned them on 2026-11-11.
    const http = fakeHttp((url) =>
      url.pathname.endsWith('/autocomplete/find')
        ? json([
            { value: '55008', label: '511/400 Example Highway, WANTIRNA SOUTH VIC 3152' },
            { value: '36827', label: '511 Example Road, FERNTREE GULLY VIC 3156' },
          ])
        : json({
            collection_day: 'Weekly collection on Wednesday',
            rubbish_date: 'Next collection is <span>18 November 2026</span>',
            recycling_date: 'Next collection is <span>11 November 2026</span>',
            green_date: 'Next collection is <span>11 November 2026</span>',
          }),
    );
    const schedule = await knox.getSchedule(
      resolved('511 Example Rd, Ferntree Gully VIC'),
      ctx(http),
    );
    expect(http.calls[0]?.searchParams.get('q')).toBe('511 Example Road');
    expect(http.calls[1]?.searchParams.get('address')).toBe('36827');
    expect(recurrences(schedule)).toEqual([
      ['general', { kind: 'interval', everyDays: 14, anchor: '2026-11-18' }],
      ['recycling', { kind: 'interval', everyDays: 14, anchor: '2026-11-11' }],
      ['organics', { kind: 'interval', everyDays: 7, anchor: '2026-11-11' }],
    ]);
  });
});
