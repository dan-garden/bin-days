import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/api/app.js';
import { CollectionsResponse, CoverageResponse, type openApiDocument } from '../src/api/openapi.js';
import { MemoryCache } from '../src/core/cache.js';
import type { BinDaysErrorCode } from '../src/core/errors.js';
import { CouncilRegistry } from '../src/councils/registry.js';
import type { CouncilAdapter } from '../src/councils/types.js';
import { type BinDaysResult, BinDaysService } from '../src/service.js';
import { d, fakeHttp } from './helpers.js';

type ApiError = { error: { code: string } };

/** A fake council so these tests exercise routing and shaping only. */
const testCouncil: CouncilAdapter = {
  id: 'qld/test',
  name: 'Test Council',
  state: 'QLD',
  lgaCodes: ['99999'],
  timezone: 'Australia/Brisbane',
  getSchedule: vi.fn<CouncilAdapter['getSchedule']>(async (address) => ({
    matchedAddress: `${address.parts.houseNumber} ${address.parts.street}, TESTVILLE`,
    services: [
      {
        type: 'general',
        name: 'Rubbish',
        colour: 'red',
        recurrence: { kind: 'interval', everyDays: 7, anchor: d('2026-11-13') },
      },
      {
        type: 'recycling',
        name: 'Recycling',
        colour: 'yellow',
        recurrence: { kind: 'interval', everyDays: 14, anchor: d('2026-11-20') },
      },
    ],
  })),
};

function makeService(lgaCode = '99999') {
  const geocoder = {
    geocode: vi.fn(async () => ({
      latitude: -27.9,
      longitude: 153.38,
      formatted: 'Somewhere',
      suburb: 'Testville',
      state: 'QLD' as const,
    })),
  };
  const square = {
    type: 'Polygon',
    coordinates: [
      [
        [153, -28],
        [154, -28],
        [154, -27],
        [153, -28],
      ],
    ],
  };
  const lgaResolver = {
    lookup: vi.fn(async () => ({ code: lgaCode, name: 'Testshire' })),
    // One LGA we support and one we don't, like a resolver asked for too much.
    boundaries: vi.fn(async () => [
      { code: '99999', geometry: square },
      { code: '00000', geometry: square },
    ]),
  };
  const service = new BinDaysService({
    registry: new CouncilRegistry([testCouncil]),
    http: fakeHttp(),
    cache: new MemoryCache(),
    geocoder,
    lgaResolver,
    now: () => new Date('2026-11-10T02:00:00Z'), // Tue 10 Nov, midday in Brisbane
  });
  return { service, geocoder, lgaResolver };
}

describe('BinDaysService', () => {
  it('returns a consistent schedule for the default two-week window', async () => {
    const { service } = makeService();
    const result = await service.lookup({ address: '1 Test St' });

    expect(result.council.id).toBe('qld/test');
    expect(result.address.parts.suburb).toBe('Testville'); // filled in from the geocoder
    expect(result.address.lga).toEqual({ code: '99999', name: 'Testshire' });
    expect(result.today).toBe('2026-11-10');
    expect(result.range).toEqual({ from: '2026-11-10', to: '2026-11-23' });
    expect(result.days).toEqual([
      {
        date: '2026-11-13',
        weekday: 'Friday',
        bins: [{ type: 'general', name: 'Rubbish', colour: 'red', confidence: 'confirmed' }],
      },
      {
        date: '2026-11-20',
        weekday: 'Friday',
        bins: [
          { type: 'general', name: 'Rubbish', colour: 'red', confidence: 'projected' },
          { type: 'recycling', name: 'Recycling', colour: 'yellow', confidence: 'confirmed' },
        ],
      },
    ]);
    expect(result.next?.date).toBe('2026-11-13');
    expect(result.services).toEqual([
      expect.objectContaining({ type: 'general', frequency: 'weekly', next: '2026-11-13' }),
      expect.objectContaining({ type: 'recycling', frequency: 'fortnightly', next: '2026-11-20' }),
    ]);
  });

  it('answers for a single date', async () => {
    const { service } = makeService();
    const result = await service.lookup({ address: '1 Test St', date: d('2026-12-04') });
    expect(result.days).toEqual([
      expect.objectContaining({
        date: '2026-12-04',
        bins: [
          expect.objectContaining({ type: 'general' }),
          expect.objectContaining({ type: 'recycling' }),
        ],
      }),
    ]);
  });

  it('caches geocoding, boundary and schedule lookups', async () => {
    const { service, geocoder, lgaResolver } = makeService();
    vi.mocked(testCouncil.getSchedule).mockClear();
    await service.lookup({ address: '2 Cache St' });
    await service.lookup({ address: '2 Cache St' });
    expect(geocoder.geocode).toHaveBeenCalledTimes(1);
    expect(lgaResolver.lookup).toHaveBeenCalledTimes(1);
    expect(testCouncil.getSchedule).toHaveBeenCalledTimes(1);
  });

  it('skips geocoding when a council is given', async () => {
    const { service, geocoder } = makeService();
    await service.lookup({ address: '1 Test St Testville', council: 'qld/test' });
    expect(geocoder.geocode).not.toHaveBeenCalled();
  });

  it.each<[string, Record<string, unknown>, BinDaysErrorCode]>([
    ['empty address', { address: ' ' }, 'INVALID_INPUT'],
    [
      'backwards range',
      { address: '1 Test St', from: '2026-12-01', to: '2026-11-01' },
      'INVALID_INPUT',
    ],
    ['huge range', { address: '1 Test St', from: '2026-01-01', to: '2028-01-01' }, 'INVALID_INPUT'],
    ['unknown council id', { address: '1 Test St', council: 'nsw/nope' }, 'COUNCIL_NOT_SUPPORTED'],
  ])('rejects %s', async (_, request, code) => {
    const { service } = makeService();
    await expect(service.lookup(request as never)).rejects.toMatchObject({ code });
  });

  it('reports unsupported councils with the LGA it found', async () => {
    const { service } = makeService('17200');
    await expect(service.lookup({ address: '1 Martin Place Sydney' })).rejects.toMatchObject({
      code: 'COUNCIL_NOT_SUPPORTED',
      details: { lga: { code: '17200' } },
    });
  });
});

describe('HTTP API', () => {
  const app = createApp(makeService().service);

  it('GET /v1/collections', async () => {
    const res = await app.request(
      '/v1/collections?address=1%20Test%20St&from=2026-11-10&to=2026-11-16',
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as BinDaysResult;
    CollectionsResponse.parse(body); // strict: fails if the response and the spec drift
    expect(body.days.map((x: { date: string }) => x.date)).toEqual(['2026-11-13']);
  });

  it('validates query params', async () => {
    const res = await app.request('/v1/collections?address=1%20Test%20St&date=13/11/2026');
    expect(res.status).toBe(400);
    expect(((await res.json()) as ApiError).error.code).toBe('INVALID_INPUT');
  });

  it('maps unsupported councils to 422', async () => {
    const res = await createApp(makeService('17200').service).request(
      '/v1/collections?address=1%20Martin%20Place%20Sydney',
    );
    expect(res.status).toBe(422);
  });

  it('GET /v1/councils', async () => {
    const res = await app.request('/v1/councils?state=qld');
    const body = (await res.json()) as { councils: Array<Record<string, unknown>> };
    expect(body.councils).toEqual([expect.objectContaining({ id: 'qld/test' })]);
    expect(body.councils[0]?.getSchedule).toBeUndefined();
  });

  it('GET /v1/coverage maps boundaries to councils and caches them', async () => {
    const { service, lgaResolver } = makeService();
    const coverageApp = createApp(service);
    const res = await coverageApp.request('/v1/coverage');
    const body = CoverageResponse.parse(await res.json());
    expect(body.features.map((f) => f.properties)).toEqual([
      { council: 'qld/test', name: 'Test Council', state: 'QLD' },
    ]);
    expect(lgaResolver.boundaries).toHaveBeenCalledWith(['99999']);
    await coverageApp.request('/v1/coverage');
    expect(lgaResolver.boundaries).toHaveBeenCalledTimes(1);
  });

  it('GET /openapi.json describes the endpoints', async () => {
    const doc = (await (await app.request('/openapi.json')).json()) as ReturnType<
      typeof openApiDocument
    >;
    const { parameters } = doc.paths['/v1/collections'].get;
    expect(parameters.map((p) => [p.name, p.required])).toEqual([
      ['address', true],
      ['date', false],
      ['from', false],
      ['to', false],
      ['council', false],
    ]);
    expect(doc.paths['/v1/councils'].get.responses[200]).toBeDefined();
    expect(doc.paths['/v1/coverage'].get.responses[200]).toBeDefined();
  });
});

describe('CouncilRegistry', () => {
  it('refuses two councils claiming the same LGA', () => {
    expect(() => new CouncilRegistry([testCouncil, { ...testCouncil, id: 'qld/other' }])).toThrow(
      /claimed by both/,
    );
  });
});
