import { describe, expect, it } from 'vitest';
import { parseAustralianAddress } from '../../src/core/address.js';
import { createArcGisZonesCouncil } from '../../src/platforms/arcgis-zones.js';
import { ctx, fakeHttp, json } from '../helpers.js';

const council = createArcGisZonesCouncil({
  id: 'vic/test',
  name: 'Test Shire Council',
  state: 'VIC',
  lgaCodes: ['29999'],
  timezone: 'Australia/Melbourne',
  layerUrl: 'https://maps.test/arcgis/rest/services/Waste/FeatureServer/0',
  bins: [
    { type: 'general', name: 'General waste', dateField: 'rub_start', weeksField: 'rub_weeks' },
    { type: 'recycling', name: 'Recycling', dateField: 'Recycledate', everyDays: 14 },
    { type: 'bulky', name: 'Hard waste', dateField: 'Hardwastedate' },
    { type: 'glass', name: 'Glass', dateField: 'missing' },
  ],
});

const input = '20 Siding Avenue, Officer VIC 3809';
const address = {
  input,
  parts: parseAustralianAddress(input),
  latitude: -38.06,
  longitude: 145.41,
};

describe('ArcGIS dated-zone adapter', () => {
  it('reads the zone at the address, from text dates and timestamps', async () => {
    // Field shapes as Cardinia and Launceston publish them.
    const zone = {
      rub_start: '2017-08-04',
      rub_weeks: 1,
      Recycledate: 1794528000000,
      Hardwastedate: 1773964800000,
    };
    const http = fakeHttp(() => json({ features: [{ attributes: zone }] }));
    const schedule = await council.getSchedule(address, ctx(http));
    expect(http.calls[0]?.pathname).toBe('/arcgis/rest/services/Waste/FeatureServer/0/query');
    expect(http.calls[0]?.searchParams.get('geometry')).toContain('"x":145.41');
    expect(schedule.services.map((s) => [s.type, s.recurrence])).toEqual([
      ['general', { kind: 'interval', everyDays: 7, anchor: '2017-08-04' }],
      ['recycling', { kind: 'interval', everyDays: 14, anchor: '2026-11-13' }],
      ['bulky', { kind: 'dates', dates: ['2026-03-20'] }],
    ]);
  });

  it('works a fortnightly bin out from its weekday and the week its area is in', async () => {
    // Field shapes as Newcastle publishes them.
    const weeks = createArcGisZonesCouncil({
      id: 'nsw/test',
      name: 'Test City Council',
      state: 'NSW',
      lgaCodes: ['19999'],
      timezone: 'Australia/Sydney',
      layerUrl: 'https://maps.test/arcgis/rest/services/Days/FeatureServer/0',
      weekField: 'WeekNo',
      bins: [
        { type: 'general', name: 'General waste', dayField: 'Day', everyDays: 7 },
        {
          type: 'recycling',
          name: 'Recycling',
          dayField: 'Day',
          weekOf: { 1: '2021-07-05', 2: '2021-06-28' },
          everyDays: 14,
        },
        { type: 'organics', name: 'Garden', dayField: 'Day', weekOf: '2021-06-28', everyDays: 14 },
      ],
    });
    const http = fakeHttp(() =>
      json({ features: [{ attributes: { Day: 'Thursday', WeekNo: 1 } }] }),
    );
    const schedule = await weeks.getSchedule(address, ctx(http));
    expect(schedule.services.map((s) => [s.type, s.recurrence])).toEqual([
      ['general', { kind: 'interval', everyDays: 7, anchor: '2026-11-12' }],
      ['recycling', { kind: 'interval', everyDays: 14, anchor: '2021-07-08' }],
      ['organics', { kind: 'interval', everyDays: 14, anchor: '2021-07-01' }],
    ]);
  });

  it('finds a property by its address in a layer of properties', async () => {
    // Field shapes as Moonee Valley and Bassendean publish them.
    const properties = createArcGisZonesCouncil({
      id: 'vic/test',
      name: 'Test City Council',
      state: 'VIC',
      lgaCodes: ['29999'],
      timezone: 'Australia/Melbourne',
      layerUrl: 'https://maps.test/arcgis/rest/services/Bins/FeatureServer/0',
      addressField: 'EZI_ADDRES',
      bins: [{ type: 'recycling', name: 'Recycling', dateField: 'recy_stdat', everyDays: 14 }],
    });
    const rows = [
      { EZI_ADDRES: "20  O'SIDING AVE  OFFICER 3809", recy_stdat: 1621987200000 },
      { EZI_ADDRES: "20 O'SIDING AVE PAKENHAM 3810", recy_stdat: 1622592000000 },
      { EZI_ADDRES: "120 O'SIDING AVE OFFICER 3809", recy_stdat: 1622592000000 },
    ];
    const http = fakeHttp(() => json({ features: rows.map((attributes) => ({ attributes })) }));
    const at = (input: string) => ({ input, parts: parseAustralianAddress(input) });

    const schedule = await properties.getSchedule(at("20 O'Siding Avenue, Officer VIC"), ctx(http));
    expect(http.calls[0]?.searchParams.get('where')).toBe(
      "UPPER(EZI_ADDRES) LIKE '20 %O''SIDING %'",
    );
    expect(schedule.matchedAddress).toBe("20 O'SIDING AVE OFFICER 3809");
    expect(schedule.services[0]?.recurrence).toMatchObject({ anchor: '2021-05-26' });

    // Two suburbs have a number 20 and neither was named: offer both rather than pick one.
    await expect(
      properties.getSchedule(at("20 O'Siding Avenue, Clyde VIC"), ctx(http)),
    ).rejects.toMatchObject({
      code: 'ADDRESS_NOT_FOUND',
      details: { suggestions: [rows[0]?.EZI_ADDRES.replace(/\s+/g, ' '), rows[1]?.EZI_ADDRES] },
    });
  });

  it('needs coordinates, and says so when no zone covers the point', async () => {
    const { latitude: _, longitude: __, ...unlocated } = address;
    await expect(council.getSchedule(unlocated, ctx(fakeHttp()))).rejects.toMatchObject({
      code: 'INVALID_INPUT',
    });
    const empty = fakeHttp(() => json({ features: [] }));
    await expect(council.getSchedule(address, ctx(empty))).rejects.toMatchObject({
      code: 'ADDRESS_NOT_FOUND',
    });
  });
});
