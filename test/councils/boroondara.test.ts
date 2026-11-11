import { describe, expect, it } from 'vitest';
import { boroondara, parseZones } from '../../src/councils/vic/boroondara.js';
import { ctx, fakeHttp, recurrences, resolved, text } from '../helpers.js';

// The script as cdn.boroondara.vic.gov.au wrote it on 2026-11-11, cut down to two areas.
const ring = (x: number) => `[[${x},-38],[${x + 1},-38],[${x + 1},-37],[${x},-37],[${x},-38]]`;
const area = (x: number, day: string, week: string) =>
  `{type:"Feature",properties:{objectid:"21",day:"${day}",week:"${week}"},geometry:{type:"Polygon",coordinates:[${ring(x)}]}}`;
const script = `const a=1,polygonData={type:"FeatureCollection",features:[${area(145, 'Tuesday', 'B')},${area(146, 'Friday', 'A')}]},boroondaraCoords=[];`;
const page = '<script src="https://cdn.boroondara.vic.gov.au/binday/js/main-v3.min.js"></script>';

describe('Boroondara adapter', () => {
  it("reads the areas out of the page's script", () => {
    expect(parseZones(script).map((zone) => zone.properties)).toEqual([
      { objectid: '21', day: 'Tuesday', week: 'B' },
      { objectid: '21', day: 'Friday', week: 'A' },
    ]);
  });

  it('gives weekly bins their next day and household waste its fortnight', async () => {
    const http = fakeHttp((url) => text(url.host.startsWith('cdn') ? script : page));
    const address = resolved('8 Example Road, Camberwell VIC', -37.5, 145.5);
    const schedule = await boroondara.getSchedule(address, ctx(http, '2026-11-11'));
    expect(http.calls[1]?.pathname).toBe('/binday/js/main-v3.min.js');
    expect(recurrences(schedule)).toEqual([
      ['general', { kind: 'interval', everyDays: 14, anchor: '2023-04-11' }],
      ['recycling', { kind: 'interval', everyDays: 7, anchor: '2026-11-17' }],
      ['organics', { kind: 'interval', everyDays: 7, anchor: '2026-11-17' }],
    ]);
  });
});
