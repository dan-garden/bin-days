import { describe, expect, it } from 'vitest';
import { parseAustralianAddress } from '../../src/core/address.js';
import { northernBeaches } from '../../src/councils/nsw/northern-beaches.js';
import { ctx, fakeHttp, json } from '../helpers.js';

// Shapes as pubapp.northernbeaches.nsw.gov.au returned them on 2026-11-10.
const properties = [
  { id: '158763', label: '1/10 Oaks Avenue DEE WHY' },
  { id: '158764', label: '2/10 Oaks Avenue DEE WHY' },
  { id: '9', label: '110 Oaks Avenue DEE WHY' },
];
const answer = (calendar: string) =>
  `<p><strong>Friday, 13 November</strong></p><a href="https://www.northernbeaches.nsw.gov.au/services/rubbish-and-recycling/bin-collection-days/${calendar}.pdf">Download calendar</a>`;

const lookup = (calendar: string) => {
  const http = fakeHttp((url, init) =>
    url.pathname.endsWith('/waste.ashx')
      ? json(properties)
      : String(init?.body) === 'property=158763'
        ? new Response(answer(calendar))
        : undefined,
  );
  const input = '10 Oaks Ave, Dee Why NSW 2099';
  return northernBeaches.getSchedule({ input, parts: parseAustralianAddress(input) }, ctx(http));
};

describe('Northern Beaches adapter', () => {
  it("reads the weekday and zone from the property's calendar", async () => {
    const schedule = await lookup('FridayB');
    expect(schedule.matchedAddress).toBe('1/10 Oaks Avenue DEE WHY');
    // As the council's 2026 Fri-B calendar shows November.
    expect(schedule.services.map((s) => [s.name, s.recurrence])).toEqual([
      ['Garbage', { kind: 'interval', everyDays: 7, anchor: '2026-11-13' }],
      ['Paper recycling', { kind: 'interval', everyDays: 14, anchor: '2026-11-06' }],
      ['Container recycling', { kind: 'interval', everyDays: 14, anchor: '2026-11-13' }],
      ['Vegetation', { kind: 'interval', everyDays: 14, anchor: '2026-11-06' }],
    ]);
  });

  it('puts zone A vegetation out with containers, on its own weekday', async () => {
    const vegetation = (await lookup('MondayA')).services[3];
    expect(vegetation?.recurrence).toMatchObject({ anchor: '2026-11-09' });
  });
});
