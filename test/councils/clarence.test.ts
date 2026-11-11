import { describe, expect, it } from 'vitest';
import { clarence } from '../../src/councils/tas/clarence.js';
import { ctx, fakeHttp, json, recurrences, resolved } from '../helpers.js';

describe('Clarence adapter', () => {
  it("works each bin's cycle out from its next two dates", async () => {
    // Shapes as ccc.tas.gov.au returned them on 2026-11-11.
    const property = '38 Example Street ROSNY PARK  TAS  7018';
    const http = fakeHttp((url) =>
      url.pathname.endsWith('/address-search')
        ? json({ results: [property], success: true })
        : json({
            success: true,
            results: [
              { name: 'Address', value: property },
              { name: 'Waste Collection Day', value: 'Wednesday' },
              { name: 'Garbage Pickup', value: 'Weekly 11/11/2026, 18/11/2026' },
              { name: 'Recycling Pickup', value: 'Fortnightly 11/11/2026, 25/11/2026' },
              { name: 'Green Waste Pickup', value: '4 Weekly 18/11/2026, 16/12/2026' },
              { name: 'Hardwaste', value: '01/03/2023' },
            ],
          }),
    );
    const schedule = await clarence.getSchedule(
      resolved('38 Example St, Rosny Park TAS'),
      ctx(http),
    );
    expect(schedule.matchedAddress).toBe('38 Example Street ROSNY PARK TAS 7018');
    expect(recurrences(schedule)).toEqual([
      ['general', { kind: 'interval', everyDays: 7, anchor: '2026-11-11' }],
      ['recycling', { kind: 'interval', everyDays: 14, anchor: '2026-11-11' }],
      ['organics', { kind: 'interval', everyDays: 28, anchor: '2026-11-18' }],
    ]);
  });
});
