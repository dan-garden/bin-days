import { describe, expect, it } from 'vitest';
import { parseAustralianAddress } from '../../src/core/address.js';
import { merriBek } from '../../src/councils/vic/merri-bek.js';
import { ctx, fakeHttp, json } from '../helpers.js';

// Shapes as the council's property list and website returned them on 2026-11-10 (lists shortened).
const property = {
  attributes: {
    EZI_Address: '7/25A ARTHUR STREET COBURG NORTH 3058',
    Waste_Rate_Code: '101',
    Recycling_Rate_Code: '142',
    FOGO_Rate_Code: '161',
    Glass_Rate_Code: '171',
    Day: 'Tuesday',
    Zone: 'A',
    GlassWeek: 2,
  },
  geometry: { x: 16139340.5, y: -4540512.3 },
};
const answer = {
  allBinDays: ['3-11-2026', '10-11-2026', '17-11-2026'],
  allRecycleDays: ['27-10-2026', '10-11-2026', '24-11-2026'],
  allFogoDays: ['3-11-2026', '10-11-2026', '17-11-2026'],
  allGlassDays: ['20-10-2026', '17-11-2026', '15-12-2026'],
};

describe('Merri-bek adapter', () => {
  it("passes the property's codes to the website and reads each bin's dates", async () => {
    const http = fakeHttp((url) =>
      url.pathname.endsWith('/query') ? json({ features: [property] }) : json([answer]),
    );
    const input = '7/25A Arthur St, Coburg North VIC 3058';
    const schedule = await merriBek.getSchedule(
      { input, parts: parseAustralianAddress(input) },
      ctx(http),
    );
    expect(http.calls[0]?.searchParams.get('returnGeometry')).toBe('true');
    expect(Object.fromEntries(http.calls[1]?.searchParams ?? [])).toMatchObject({
      xPoint: '16139340.5',
      wasteDay: 'Tuesday',
      zone: 'A',
      glassWeekNumber: '2',
      address: '7/25A ARTHUR STREET COBURG NORTH 3058',
    });
    // From the next listed date, at the cycle the list shows.
    expect(schedule.services.map((s) => [s.type, s.recurrence])).toEqual([
      ['general', { kind: 'interval', everyDays: 7, anchor: '2026-11-10' }],
      ['recycling', { kind: 'interval', everyDays: 14, anchor: '2026-11-10' }],
      ['organics', { kind: 'interval', everyDays: 7, anchor: '2026-11-10' }],
      ['glass', { kind: 'interval', everyDays: 28, anchor: '2026-11-17' }],
    ]);
  });
});
