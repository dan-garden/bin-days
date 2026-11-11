import { describe, expect, it } from 'vitest';
import { wollondilly } from '../../src/councils/nsw/wollondilly.js';
import { ctx, fakeHttp, json, recurrences, resolved } from '../helpers.js';

describe('Wollondilly adapter', () => {
  it('reads the next two collections into three bins', async () => {
    // Shapes as the council's lookup returned them on 2026-11-11.
    const field = (name: string, value: string) => ({ name, caption: name, value });
    const http = fakeHttp((url) =>
      url.pathname.endsWith('/wcc_address_lookup')
        ? json([
            [
              field('PropertyAddress', '10 Example Street West PICTON NSW'),
              field('ParcelNo', '11730'),
            ],
          ])
        : json([
            [
              field('Waste Service', 'Residential'),
              field('WasteNextPickupType1', 'Monday, 16 November 2026, Garbage and Recycling'),
              field('WasteNextPickupType2', 'Monday, 23 November 2026, Garbage and Garden Organic'),
            ],
          ]),
    );
    const schedule = await wollondilly.getSchedule(
      resolved('10 Example Street West, Picton NSW'),
      ctx(http),
    );
    expect(http.calls[1]?.searchParams.get('fields')).toBe('11730');
    expect(recurrences(schedule)).toEqual([
      ['general', { kind: 'interval', everyDays: 7, anchor: '2026-11-16' }],
      ['recycling', { kind: 'interval', everyDays: 14, anchor: '2026-11-16' }],
      ['organics', { kind: 'interval', everyDays: 14, anchor: '2026-11-23' }],
    ]);
  });
});
