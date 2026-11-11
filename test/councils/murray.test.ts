import { describe, expect, it } from 'vitest';
import { murray } from '../../src/councils/wa/murray.js';
import { ctx, fakeHttp, json, recurrences, resolved } from '../helpers.js';

describe('Murray adapter', () => {
  it("gives each bin's next date and cycle, and leaves out verge collections", async () => {
    // Shapes as murray.wa.gov.au returned them on 2026-11-11.
    const bin = (Name: string, Interval: number, NextCollectionDate: string) => ({
      BinType: { Name },
      Interval,
      NextCollectionDate,
    });
    const http = fakeHttp((url) =>
      url.pathname.endsWith('/GetAddressesByQuery')
        ? json([{ Guid: 'abc', Address: '1006 Example Road, North Yunderup' }])
        : json({
            CollectionData: [
              bin('General Waste', 7, '2026-11-12T00:00:00'),
              bin('Recycling', 14, '2026-11-19T00:00:00'),
              bin('Verge Collection - Green waste', 0, '2027-05-17T00:00:00'),
            ],
          }),
    );
    const schedule = await murray.getSchedule(
      resolved('1006 Example Rd, North Yunderup WA'),
      ctx(http),
    );
    expect(http.calls[1]?.searchParams.get('id')).toBe('abc');
    expect(recurrences(schedule)).toEqual([
      ['general', { kind: 'interval', everyDays: 7, anchor: '2026-11-12' }],
      ['recycling', { kind: 'interval', everyDays: 14, anchor: '2026-11-19' }],
    ]);
  });
});
