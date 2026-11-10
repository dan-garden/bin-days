import { describe, expect, it } from 'vitest';
import { parseAustralianAddress } from '../../src/core/address.js';
import { centralCoast, parseCollectionPage } from '../../src/councils/nsw/central-coast.js';
import { ctx, fakeHttp, json } from '../helpers.js';

// The markup of a 1coast.com.au collection page, fetched 2026-11-10, cut down to its bins.
const bin = (colour: string, name: string, frequency: string, next: string) => `
  <div class="booking-list--collection-details col-xs-9">
    <span class="booking-list--legend-wrapper"><span class="legend ${colour}"></span>${name}</span>
    <div>
      <div><span class="grey-light">Frequency</span> <span class="grey">${frequency}</span></div>
      <div><span class="grey-light">Next Collection</span> <span class="grey">${next}</span></div>
    </div>
  </div>`;
const page =
  bin('green', '240L Green Lid Garden Vegetation Bin', 'Fortnightly', 'Fri, 13-Nov-2026') +
  bin('red', '140L Red Lid General Waste Bin', 'Weekly', 'Fri, 13-Nov-2026') +
  bin('yellow', '240L Yellow Lid Recycle Bin', 'Fortnightly', 'Fri, 20-Nov-2026') +
  bin('red', '', '-', 'Fri, 13-Nov-2026'); // an unnamed entry the page also carries

const properties = [
  { id: '1', name: ['49', 'OLD GOSFORD RD', 'WAMBERAL', 'CENTRAL COAST', '2260'] },
  { id: '2', name: ['49', 'GOSFORD RD', 'WAMBERAL', 'CENTRAL COAST', '2260'] },
].map((p) => ({ ...p, collection: { frequency: 'W12', day: 'FRI' } }));

describe('Central Coast adapter', () => {
  it('reads each named bin, its cycle and its next date from the page', () => {
    expect(parseCollectionPage(page).map((s) => [s.type, s.colour, s.recurrence])).toEqual([
      ['organics', 'green', { kind: 'interval', everyDays: 14, anchor: '2026-11-13' }],
      ['general', 'red', { kind: 'interval', everyDays: 7, anchor: '2026-11-13' }],
      ['recycling', 'yellow', { kind: 'interval', everyDays: 14, anchor: '2026-11-20' }],
    ]);
  });

  it("finds the property and asks for its collection codes' page", async () => {
    const http = fakeHttp((url) =>
      url.pathname === '/ajax.php' ? json(properties) : new Response(page),
    );
    const input = '49 Old Gosford Road, Wamberal NSW 2260';
    const schedule = await centralCoast.getSchedule(
      { input, parts: parseAustralianAddress(input) },
      ctx(http),
    );
    expect(http.calls[0]?.searchParams.get('s')).toBe('49 Old Gosford Rd');
    expect(Object.fromEntries(http.calls[1]?.searchParams ?? [])).toMatchObject({
      address: '1',
      'collection[frequency]': 'W12',
      'collection[day]': 'FRI',
    });
    expect(schedule.matchedAddress).toBe('49 OLD GOSFORD RD WAMBERAL CENTRAL COAST 2260');
    expect(schedule.services).toHaveLength(3);
  });
});
