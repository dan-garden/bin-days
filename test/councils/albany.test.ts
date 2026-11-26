import { describe, expect, it } from 'vitest';
import { albany } from '../../src/councils/wa/albany.js';
import { ctx, fakeHttp, json, resolved } from '../helpers.js';

// Shapes as Albany's map layers returned them on 2026-11-26: zone B, collected on Mondays.
const monday = { monday: 'Yes', tuesday: 'No', wednesday: 'No' };
const http = () =>
  fakeHttp((url) =>
    json({ features: url.pathname.includes('_Pickup_B/') ? [{ attributes: monday }] : [] }),
  );
const address = resolved('24 Example Road, Yakamia WA', -35.0, 117.88);

describe('Albany adapter', () => {
  it('counts each fortnight from the week the map counts from', async () => {
    const schedule = await albany.getSchedule(address, ctx(http(), '2026-11-26'));
    expect(schedule.services.slice(0, 2).map((s) => [s.type, s.recurrence])).toEqual([
      ['general', { kind: 'interval', everyDays: 14, anchor: '2021-06-21' }],
      ['recycling', { kind: 'interval', everyDays: 14, anchor: '2021-06-28' }],
    ]);
  });

  it('collects FOGO every week in summer, and every second week otherwise', async () => {
    const schedule = await albany.getSchedule(address, ctx(http(), '2026-12-14'));
    const fogo = schedule.services.find((s) => s.type === 'organics')?.recurrence;
    const dates = fogo?.kind === 'dates' ? fogo.dates : [];
    expect(dates.slice(0, 5)).toEqual([
      '2026-12-14',
      '2026-12-21',
      '2026-12-28',
      '2027-01-04',
      '2027-01-11',
    ]);
    // Summer ends on 12 February: the recycling week of 1 February is still in it, 15 February isn't.
    expect(dates.filter((d) => d >= '2027-02-01' && d < '2027-03-01')).toEqual([
      '2027-02-01',
      '2027-02-08',
      '2027-02-22',
    ]);
  });
});
