import { describe, expect, it } from 'vitest';
import { cockburn } from '../../src/councils/wa/cockburn.js';
import { ctx, fakeHttp, recurrences, resolved, text } from '../helpers.js';

// The service wraps its answers in a call, as gis1.cockburn.wa.gov.au did on 2026-11-11.
const jsonp = (data: unknown) =>
  text(`/**/ typeof cb === 'function' && cb(${JSON.stringify(data)});`);

describe('Cockburn adapter', () => {
  it('gives the weekly bins their day and the garden bin its date', async () => {
    const http = fakeHttp((url) =>
      url.pathname.includes('FuzzySearch')
        ? jsonp([{ name: '9 Example Crescent Spearwood WA 6163', dbkey: '2201726' }])
        : jsonp([
            {
              Address: '9 Example Crescent SPEARWOOD WA 6163',
              BinDay: 'Thursday',
              GardenWaste: 'Thursday Fortnightly (19-Nov-2026) (if applicable)',
            },
          ]),
    );
    const schedule = await cockburn.getSchedule(
      resolved('9 Example Cres, Spearwood WA'),
      ctx(http, '2026-11-11'),
    );
    expect(http.calls[0]?.searchParams.get('callback')).toBe('cb');
    expect(http.calls[1]?.searchParams.get('q')).toBe('2201726');
    expect(recurrences(schedule)).toEqual([
      ['general', { kind: 'interval', everyDays: 7, anchor: '2026-11-12' }],
      ['recycling', { kind: 'interval', everyDays: 7, anchor: '2026-11-12' }],
      ['organics', { kind: 'interval', everyDays: 14, anchor: '2026-11-19' }],
    ]);
  });
});
