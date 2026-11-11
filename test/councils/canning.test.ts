import { describe, expect, it } from 'vitest';
import { canning } from '../../src/councils/wa/canning.js';
import { ctx, fakeHttp, json, recurrences, resolved } from '../helpers.js';

describe('Canning adapter', () => {
  // Shapes as canning.wa.gov.au returned them on 2026-11-11.
  const found = [{ key: '1730051', address: '20 Example Road RIVERTON  6148' }];

  it("reads each bin's next date as a day in Perth", async () => {
    const http = fakeHttp((url) =>
      url.pathname.includes('/find/')
        ? json(found)
        : json({
            greenWasteCollectionDates: [],
            rubbishCollectionDate: '2026-11-12T16:00:00+00:00',
            recyclingCollectionDate: null,
          }),
    );
    const schedule = await canning.getSchedule(resolved('20 Example Rd, Riverton WA'), ctx(http));
    expect(http.calls[0]?.pathname).toBe('/api/property-details/find/20%20Example%20Road');
    expect(http.calls[1]?.pathname).toBe('/api/property-details/bins/1730051');
    // 16:00 UTC is midnight in Perth, so the date is the next day.
    expect(recurrences(schedule)).toEqual([['general', { kind: 'dates', dates: ['2026-11-13'] }]]);
  });

  it('treats an empty answer as no such address', async () => {
    const http = fakeHttp(() => new Response(null, { status: 204 }));
    await expect(
      canning.getSchedule(resolved('20 Example Rd, Riverton WA'), ctx(http)),
    ).rejects.toMatchObject({ code: 'ADDRESS_NOT_FOUND' });
  });
});
