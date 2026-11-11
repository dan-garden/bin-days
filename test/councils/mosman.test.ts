import { describe, expect, it } from 'vitest';
import { mosman } from '../../src/councils/nsw/mosman.js';
import { ctx, fakeHttp, json, recurrences, resolved, text } from '../helpers.js';

describe('Mosman adapter', () => {
  it("picks the unit from the suggestions and gives each collection's next date", async () => {
    // Shapes as apps.mosman.nsw.gov.au returned them on 2026-11-11.
    const suggestions =
      '<residents><item><address>1/120 Example Road</address><zone>1.2</zone></item>' +
      '<item><address>4/120 Example Road</address><zone>1.2</zone></item></residents>';
    const collection = (type: string, calendarDate: string) => ({
      type,
      calendarDate,
      zone: '1.2',
    });
    const http = fakeHttp((url) =>
      url.pathname === '/test'
        ? json([
            collection('vegetation', '2026-12-14 00:00:00'),
            collection('generalWaste', '2026-11-16 00:00:00'),
            collection('paperCardboard', '2026-11-16 00:00:00'),
            collection('ewaste', '2027-03-07 00:00:00'),
          ])
        : text(suggestions),
    );
    const schedule = await mosman.getSchedule(resolved('4/120 Example Rd, Mosman NSW'), ctx(http));
    expect(http.calls[0]?.searchParams.get('a')).toBe('120 Example Road');
    expect(schedule.matchedAddress).toBe('4/120 Example Road, Mosman');
    expect(recurrences(schedule)).toEqual([
      ['organics', { kind: 'dates', dates: ['2026-12-14'] }],
      ['general', { kind: 'interval', everyDays: 7, anchor: '2026-11-16' }],
      ['recycling', { kind: 'dates', dates: ['2026-11-16'] }],
    ]);
  });
});
