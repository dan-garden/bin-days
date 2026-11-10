import { describe, expect, it } from 'vitest';
import { matchesHouseNumber, parseAustralianAddress } from '../../src/core/address.js';
import { BinDaysError } from '../../src/core/errors.js';
import { goldCoast } from '../../src/councils/qld/gold-coast.js';
import { parseOpenCitiesWasteServices } from '../../src/platforms/opencities.js';
import { ctx, fakeHttp, fixture, json } from '../helpers.js';

const wasteServices = JSON.parse(fixture('opencities-gold-coast-wasteservices.json'));
const GEO_ID = '00000000-0000-4000-8000-000000000012';

const address = (input: string) => ({ input, parts: parseAustralianAddress(input) });

describe('OpenCities waste-services parser', () => {
  it('parses the real Gold Coast widget', () => {
    expect(parseOpenCitiesWasteServices(wasteServices.responseContent)).toEqual([
      {
        type: 'general',
        name: 'General waste',
        colour: 'red',
        recurrence: { kind: 'interval', everyDays: 7, anchor: '2026-11-13' },
      },
      {
        type: 'recycling',
        name: 'Recycling',
        colour: 'yellow',
        recurrence: { kind: 'interval', everyDays: 14, anchor: '2026-11-20' },
      },
      {
        type: 'organics',
        name: 'Green organics',
        colour: 'lime',
        recurrence: { kind: 'interval', everyDays: 14, anchor: '2026-11-13' },
      },
    ]);
  });

  it('falls back to a single date when no frequency is given', () => {
    const html = `<div class="waste-services-result"><h3>Bulky goods</h3>
      <div class="next-service">Mon 7/12/2026</div></div>`;
    expect(parseOpenCitiesWasteServices(html)[0]?.recurrence).toEqual({
      kind: 'dates',
      dates: ['2026-12-07'],
    });
  });
});

describe('matchesHouseNumber', () => {
  it.each([
    ['12 Example Road, TESTVILLE 4000', { houseNumber: '12' }, true],
    ['112 Example Road, TESTVILLE 4000', { houseNumber: '12' }, false],
    ['2/35 Peel Street', { houseNumber: '35', unit: '2' }, true],
    ['3/35 Peel Street', { houseNumber: '35', unit: '2' }, false],
    ['Unit 2/35 Peel Street', { houseNumber: '35' }, true],
    ['Example Road', { houseNumber: '12' }, false],
    [
      '5 Tallebudgera Drive, PALM BEACH 4221',
      { houseNumber: '5', streetName: 'Tallebudgera' },
      true,
    ],
    ['5 Dudgeon Drive, TALLEBUDGERA 4228', { houseNumber: '5', streetName: 'Tallebudgera' }, false],
    ['7 Bayview Street', { houseNumber: '7', streetName: 'Bay' }, false],
  ])('%s with %o -> %s', (line, parts, expected) => {
    expect(matchesHouseNumber(line, parts)).toBe(expected);
  });
});

describe('Gold Coast adapter', () => {
  const searchHit = {
    Items: [{ Id: GEO_ID, AddressSingleLine: '12 Example Road, TESTVILLE 4000' }],
  };

  it('searches, then fetches services for the matched property', async () => {
    const http = fakeHttp((url) => {
      if (url.pathname === '/api/v1/myarea/search') return json(searchHit);
      if (url.pathname === '/ocapi/Public/myarea/wasteservices') {
        expect(url.searchParams.get('geolocationid')).toBe(GEO_ID);
        return json(wasteServices);
      }
    });

    const schedule = await goldCoast.getSchedule(
      address('12 Example Rd, Testville QLD 4000'),
      ctx(http),
    );

    expect(schedule.matchedAddress).toBe('12 Example Road, TESTVILLE 4000');
    expect(schedule.propertyId).toBe(GEO_ID);
    expect(schedule.services.map((s) => s.type)).toEqual(['general', 'recycling', 'organics']);
    // The search must not include the state/postcode, because OpenCities returns nothing if it does.
    expect(http.calls[0]?.searchParams.get('keywords')).toBe('12 Example Road Testville');
  });

  it('retries with a session cookie when the first call fails', async () => {
    let attempts = 0;
    const http = fakeHttp((url, init) => {
      if (url.pathname === '/api/v1/myarea/search') return json(searchHit);
      if (url.pathname.startsWith('/Services/')) {
        return new Response('ok', { headers: { 'set-cookie': 'ASP.NET_SessionId=abc; path=/' } });
      }
      if (url.pathname === '/ocapi/Public/myarea/wasteservices') {
        attempts++;
        const cookie = new Headers(init?.headers).get('cookie');
        return cookie === 'ASP.NET_SessionId=abc' ? json(wasteServices) : json({ success: false });
      }
    });
    const schedule = await goldCoast.getSchedule(address('12 Example Rd Testville'), ctx(http));
    expect(attempts).toBe(2);
    expect(schedule.services).toHaveLength(3);
  });

  it('rejects a search result for a different house number', async () => {
    const http = fakeHttp((url) => {
      if (url.pathname === '/api/v1/myarea/search') return json(searchHit);
    });
    const error = await goldCoast
      .getSchedule(address('999 Example Rd Testville'), ctx(http))
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(BinDaysError);
    expect((error as BinDaysError).code).toBe('ADDRESS_NOT_FOUND');
    expect((error as BinDaysError).details?.suggestions).toEqual([
      '12 Example Road, TESTVILLE 4000',
    ]);
  });

  it('accepts a wrong suburb only when the street is unambiguous', async () => {
    const elsewhere = { Id: 'x', AddressSingleLine: '12 Example Road, NERANG 4211' };
    const http = (items: unknown[]) =>
      fakeHttp((url) => {
        if (url.pathname === '/api/v1/myarea/search') {
          // Like the real search: nothing for the wrong suburb, hits without one.
          const hit = url.searchParams.get('keywords') === '12 Example Road';
          return json({ Items: hit ? items : [] });
        }
        if (url.pathname === '/ocapi/Public/myarea/wasteservices') return json(wasteServices);
      });
    const wrongSuburb = address('12 Example Rd Elsewhere Bay');

    const schedule = await goldCoast.getSchedule(wrongSuburb, ctx(http(searchHit.Items)));
    expect(schedule.matchedAddress).toBe('12 Example Road, TESTVILLE 4000');

    await expect(
      goldCoast.getSchedule(wrongSuburb, ctx(http([...searchHit.Items, elsewhere]))),
    ).rejects.toMatchObject({ code: 'ADDRESS_NOT_FOUND' });
  });
});
