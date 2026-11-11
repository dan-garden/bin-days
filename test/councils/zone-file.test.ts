import { describe, expect, it } from 'vitest';
import { corangamite } from '../../src/councils/vic/corangamite.js';
import { melbourne } from '../../src/councils/vic/melbourne.js';
import { createZoneFileCouncil, type ZoneFileConfig } from '../../src/platforms/zone-file.js';
import { ctx, fakeHttp, json, recurrences, resolved } from '../helpers.js';

const info: ZoneFileConfig = {
  id: 'vic/test',
  name: 'Test Shire Council',
  state: 'VIC',
  lgaCodes: ['29999'],
  timezone: 'Australia/Melbourne',
  fileUrl: 'https://maps.test/zones.json',
};

const address = resolved('1 Example Street, Exampleton VIC 3000', -37.5, 144.5);

/** A file with one zone that covers the address and one that doesn't. */
const file = (properties: Record<string, unknown>) =>
  json({
    features: [
      {
        properties: { rub_day: 'Friday', rub_start: '2020-01-03', rub_weeks: 1 },
        geometry: box(0),
      },
      { properties, geometry: box(144) },
    ],
  });
const box = (x: number) => ({
  type: 'Polygon',
  coordinates: [
    [
      [x, -38],
      [x + 1, -38],
      [x + 1, -37],
      [x, -37],
      [x, -38],
    ],
  ],
});

describe('zone-file adapter', () => {
  it('reads the Open Council Data fields of the zone the address is in', async () => {
    // Field shapes as Strathbogie, Hindmarsh and Central Goldfields publish them: capitalised
    // names, `_week` for `_weeks`, numbers as text, and a start date that is off its weekday.
    const http = fakeHttp(() =>
      file({
        Rub_day: 'Tuesday',
        Rub_start: '2017-05-16',
        Rub_weeks: '2',
        rec_day: 'Wednesday',
        rec_start: '2019-06-10',
        rec_week: 2,
        grn_day: 'Friday',
        grn_weeks: 'null',
        gls_day: 'Tuesday',
        gls_start: '2025-07-22',
        gls_weeks: 4.0,
      }),
    );
    const council = createZoneFileCouncil(info);
    const schedule = await council.getSchedule(address, ctx(http));
    expect(recurrences(schedule)).toEqual([
      ['general', { kind: 'interval', everyDays: 14, anchor: '2017-05-16' }],
      ['recycling', { kind: 'interval', everyDays: 14, anchor: '2019-06-12' }],
      ['glass', { kind: 'interval', everyDays: 28, anchor: '2025-07-22' }],
    ]);
  });

  it("reads a council's own fields, with dates as its map writes them", async () => {
    // Field shapes as Greater Bendigo publishes them.
    const council = createZoneFileCouncil({
      ...info,
      bins: [
        { type: 'general', name: 'General waste', dateField: 'Next Waste Pickup', everyDays: 14 },
        { type: 'organics', name: 'Organics', dateField: 'Next Organics Pickup' },
      ],
    });
    const http = fakeHttp(() =>
      file({ 'Next Waste Pickup': ' 20-Nov-2026', 'Next Organics Pickup': ' 13-Nov-2026' }),
    );
    expect(recurrences(await council.getSchedule(address, ctx(http)))).toEqual([
      ['general', { kind: 'interval', everyDays: 14, anchor: '2026-11-20' }],
      ['organics', { kind: 'dates', dates: ['2026-11-13'] }],
    ]);
  });

  it('says so when the address is in no zone', async () => {
    const council = createZoneFileCouncil(info);
    const http = fakeHttp(() => file({}));
    await expect(
      council.getSchedule({ ...address, longitude: 150 }, ctx(http)),
    ).rejects.toMatchObject({ code: 'ADDRESS_NOT_FOUND' });
  });
});

describe('Corangamite adapter', () => {
  it('lists the green bin weekly from October to December and fortnightly otherwise', async () => {
    const http = fakeHttp(() =>
      file({ grn_day: 'Wednesday', grn_start: '2020-01-01', grn_weeks: '2' }),
    );
    const schedule = await corangamite.getSchedule(address, ctx(http, '2026-12-14'));
    const [organics] = schedule.services;
    expect(organics?.recurrence).toMatchObject({ kind: 'dates' });
    const dates = organics?.recurrence.kind === 'dates' ? organics.recurrence.dates : [];
    expect(dates.slice(0, 5)).toEqual([
      '2026-12-16',
      '2026-12-23',
      '2026-12-30',
      '2027-01-06',
      '2027-01-20',
    ]);
  });
});

describe('Melbourne adapter', () => {
  it('asks the open data portal for the zone at the address', async () => {
    // Field shapes as data.melbourne.vic.gov.au returned them on 2026-11-11.
    const zone = {
      rub_day: 'Tuesday',
      rub_weeks: '1',
      rub_start: '2015/09/22',
      rec_day: 'Tuesday',
      rec_weeks: '1',
      rec_start: '2015/09/22',
    };
    const http = fakeHttp(() => json({ total_count: 1, results: [zone] }));
    const schedule = await melbourne.getSchedule(address, ctx(http));
    expect(http.calls[0]?.searchParams.get('where')).toBe(
      "intersects(geo_shape, geom'POINT(144.5 -37.5)')",
    );
    expect(recurrences(schedule)).toEqual([
      ['general', { kind: 'interval', everyDays: 7, anchor: '2015-09-22' }],
      ['recycling', { kind: 'interval', everyDays: 7, anchor: '2015-09-22' }],
    ]);
  });
});
