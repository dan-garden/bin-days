import { describe, expect, it } from 'vitest';
import { northernGrampians } from '../../src/councils/vic/northern-grampians.js';
import { vincent } from '../../src/councils/wa/vincent.js';
import { ctx, fakeHttp, json, recurrences, resolved } from '../helpers.js';

/** A Pozi map: the list naming its map server, then that server's answer. */
const pozi = (site: string, features: Array<Record<string, unknown>>) =>
  fakeHttp((url) =>
    url.pathname.endsWith('/datasets')
      ? json({
          mapdatasets: [
            {
              datasets: [
                {
                  title: 'QGIS Project',
                  url: `https://${site}.pozi.com/proxy/v1/maps/x/datasets/1`,
                },
              ],
            },
          ],
        })
      : json({ features: features.map((properties) => ({ properties })) }),
  );

describe('Pozi map councils', () => {
  it('Northern Grampians: reads the area at the address, whose dates have no year', async () => {
    // Shapes as northerngrampians.pozi.com returned them on 2026-11-11.
    const http = pozi('northerngrampians', [
      {
        Next_Recycling_Pickup: 'Wednesday 18 November',
        'Next_Rubbish_Pickup ': 'Wednesday 18 November',
      },
    ]);
    const address = resolved('59 Example Street, Stawell VIC', -37.0568, 142.7791);
    const schedule = await northernGrampians.getSchedule(address, ctx(http, '2026-11-11'));
    expect(http.calls[1]?.searchParams.get('TYPENAME')).toBe('Waste_Collection_Days');
    expect(http.calls[1]?.searchParams.get('BBOX')).toMatch(
      /^142\.779\d*,-37\.0569\d*,.*,EPSG:4326$/,
    );
    expect(recurrences(schedule)).toEqual([
      ['general', { kind: 'interval', everyDays: 7, anchor: '2026-11-18' }],
      ['recycling', { kind: 'interval', everyDays: 14, anchor: '2026-11-18' }],
    ]);
  });

  it("Vincent: finds the property and reads each bin's date and cycle", async () => {
    // Shapes as vincent.pozi.com returned them on 2026-11-11.
    const worded = (label: string, value: string) =>
      `<p style="x">${label}:</p><p style="x">${value}</p>`;
    const http = pozi('vincent', [
      { Address: '313 Example St, Leederville', 'General Waste Collection Day': null },
      {
        Address: '313 Example St, Leederville',
        'General Waste Collection Day': worded(
          'General Waste Collection Day',
          '16 Nov 2026 - Fortnightly (Monday Week 1)',
        ),
        'Recycling Collection Day': worded(
          'Recycling Collection Day',
          '23 Nov 2026 - Fortnightly (Monday Week 2)',
        ),
        'FOGO Collection Day': worded('FOGO Collection Day', '16 Nov 2026 - Weekly (Monday)'),
      },
    ]);
    const schedule = await vincent.getSchedule(
      resolved('313 Example Street, Leederville WA'),
      ctx(http),
    );
    expect(http.calls[1]?.searchParams.get('EXP_FILTER')).toBe(`"Address" ILIKE '313 Example St%'`);
    expect(recurrences(schedule)).toEqual([
      ['general', { kind: 'interval', everyDays: 14, anchor: '2026-11-16' }],
      ['recycling', { kind: 'interval', everyDays: 14, anchor: '2026-11-23' }],
      ['organics', { kind: 'interval', everyDays: 7, anchor: '2026-11-16' }],
    ]);
  });
});
