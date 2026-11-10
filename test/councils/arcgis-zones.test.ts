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
