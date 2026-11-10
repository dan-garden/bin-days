import { describe, expect, it } from 'vitest';
import { parseAustralianAddress } from '../../src/core/address.js';
import { sydney } from '../../src/councils/nsw/sydney.js';
import { ctx, fakeHttp, json } from '../helpers.js';

// Real responses from the City of Sydney's bin day widget, fetched 2026-11-10.
const matches = [
  { propertyKey: 514348, fullAddress: '456 Kent Street, Sydney' },
  { propertyKey: 542438, fullAddress: '2/456 Kent Street, Sydney' },
];
const bins = [
  {
    roundDescription: 'Waste',
    nextPickupDate: 'Tuesday 10/11/2026',
    pickupDateAfterNext: 'Tuesday 17/11/2026',
  },
  {
    roundDescription: 'Recycling',
    nextPickupDate: 'Tuesday 10/11/2026',
    pickupDateAfterNext: 'Tuesday 17/11/2026',
  },
  {
    roundDescription: 'Green Waste',
    nextPickupDate: 'Tuesday 10/11/2026',
    pickupDateAfterNext: 'Tuesday 24/11/2026',
  },
];

const setup = (schedule: Response) =>
  fakeHttp((url) => {
    if (url.pathname === '/api/search') return json({ matchingProperties: matches });
    if (url.pathname.endsWith('/bins-collection')) return schedule;
  });

const lookup = (input: string, http: ReturnType<typeof setup>) =>
  sydney.getSchedule({ input, parts: parseAustralianAddress(input) }, ctx(http));

describe('City of Sydney adapter', () => {
  it('searches by street line and takes the cycle from the two dates given', async () => {
    const http = setup(json({ bins }));
    const schedule = await lookup('456 Kent St, Sydney NSW 2000', http);
    expect(http.calls[0]?.searchParams.get('address')).toBe('456 Kent Street');
    expect(http.calls[1]?.pathname).toBe('/api/property/514348/bins-collection'); // the building, not unit 2
    expect(schedule.services.map((s) => [s.type, s.name, s.recurrence])).toEqual([
      ['general', 'Waste', { kind: 'interval', everyDays: 7, anchor: '2026-11-10' }],
      ['recycling', 'Recycling', { kind: 'interval', everyDays: 7, anchor: '2026-11-10' }],
      ['organics', 'Green Waste', { kind: 'interval', everyDays: 14, anchor: '2026-11-10' }],
    ]);
    expect((await lookup('2/456 Kent St, Sydney', setup(json({ bins })))).matchedAddress).toBe(
      '2/456 Kent Street, Sydney',
    );
  });

  it('explains when the council lists no kerbside collection for the property', async () => {
    await expect(
      lookup('456 Kent St, Sydney', setup(new Response(null, { status: 204 }))),
    ).rejects.toMatchObject({
      code: 'ADDRESS_NOT_FOUND',
      message: expect.stringContaining('serviced separately'),
    });
  });
});
