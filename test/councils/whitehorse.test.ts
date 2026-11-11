import { describe, expect, it } from 'vitest';
import { whitehorse } from '../../src/councils/vic/whitehorse.js';
import { ctx, fakeHttp, json, recurrences, resolved } from '../helpers.js';

describe('Whitehorse adapter', () => {
  it('finds the property, then the collection area at that spot', async () => {
    // Shapes as map.whitehorse.vic.gov.au returned them on 2026-11-11.
    const area = {
      collectionDay: 'Monday',
      week: 2,
      nextRecycle: '23 Nov 2026',
      nextGOBS: '16 Nov 2026',
    };
    const http = fakeHttp((url) =>
      url.pathname.endsWith('/index/search')
        ? json({
            results: [
              { display1: '20 Example Road NUNAWADING', centroid: { x: 145.18, y: -37.81 } },
            ],
          })
        : json({ features: [{ properties: { dd_whm_waste: [area] } }] }),
    );
    const schedule = await whitehorse.getSchedule(
      resolved('20 Example Rd, Nunawading VIC'),
      ctx(http, '2026-11-11'),
    );
    expect(http.calls[0]?.searchParams.get('query')).toBe('20 Example Road Nunawading');
    expect(http.calls[1]?.searchParams.get('shape')).toBe('POINT(145.18 -37.81)');
    expect(recurrences(schedule)).toEqual([
      ['general', { kind: 'interval', everyDays: 7, anchor: '2026-11-16' }],
      ['recycling', { kind: 'interval', everyDays: 14, anchor: '2026-11-23' }],
      ['organics', { kind: 'interval', everyDays: 14, anchor: '2026-11-16' }],
    ]);
  });
});
