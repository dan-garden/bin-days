import { describe, expect, it } from 'vitest';
import { parseAustralianAddress } from '../../src/core/address.js';
import {
  createMyLocalServicesCouncil,
  nextZoneCollection,
} from '../../src/platforms/my-local-services.js';
import { ctx, d, fakeHttp, json } from '../helpers.js';

const council = createMyLocalServicesCouncil({
  id: 'sa/test',
  name: 'Test Council',
  state: 'SA',
  lgaCodes: ['49999'],
  timezone: 'Australia/Adelaide',
});

const zone = (Waste_Type: string, Colour: string, Col_Freq: number, Col_Offset: number) => ({
  attributes: { Waste_Type, Colour, Col_Day: 6, Col_Freq, Col_Offset },
});

/** Layer 0 is general waste, 1 recycling, 2 green waste; 4 is empty here. */
const LAYERS: Record<string, unknown[]> = {
  '0': [zone('General Waste', 'Red', 1, 0)],
  '1': [zone('Recycling', 'Yellow', 2, 0)],
  '2': [zone('Green Waste', 'Green', 2, 1)],
};

const http = () =>
  fakeHttp((url) => {
    const layer = /FeatureServer\/(\d)\/query/.exec(url.pathname)?.[1];
    if (layer) return json({ features: LAYERS[layer] ?? [] });
  });

const address = {
  input: '12 Beach Road, Christies Beach SA',
  parts: parseAustralianAddress('12 Beach Road, Christies Beach SA'),
};

describe('My Local Services (South Australia)', () => {
  // These three were checked against Onkaparinga's own website on 2026-11-10.
  it('works out the next collection from weekday, cycle and offset', () => {
    const today = d('2026-11-10');
    expect(nextZoneCollection(today, { day: 6, everyWeeks: 1, offsetWeeks: 0 })).toBe('2026-11-13');
    expect(nextZoneCollection(today, { day: 6, everyWeeks: 2, offsetWeeks: 0 })).toBe('2026-11-20');
    expect(nextZoneCollection(today, { day: 6, everyWeeks: 2, offsetWeeks: 1 })).toBe('2026-11-13');
    // A collection today counts, and early January waits for the offset.
    expect(nextZoneCollection(d('2026-11-13'), { day: 6, everyWeeks: 2, offsetWeeks: 1 })).toBe(
      '2026-11-13',
    );
    expect(nextZoneCollection(d('2026-01-01'), { day: 6, everyWeeks: 2, offsetWeeks: 1 })).toBe(
      '2026-01-09',
    );
  });

  it('finds the zones at the address and turns them into services', async () => {
    const client = http();
    const schedule = await council.getSchedule(
      {
        ...address,
        latitude: -35.14,
        longitude: 138.47,
        formatted: '12 Beach Road, Christies Beach',
      },
      ctx(client),
    );
    expect(client.calls).toHaveLength(4);
    expect(client.calls[0]?.searchParams.get('geometry')).toContain('"x":138.47');
    expect(schedule.matchedAddress).toBe('12 Beach Road, Christies Beach');
    expect(schedule.services).toEqual([
      {
        type: 'general',
        name: 'General Waste',
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
        name: 'Green Waste',
        colour: 'green',
        recurrence: { kind: 'interval', everyDays: 14, anchor: '2026-11-13' },
      },
    ]);
  });

  it('turns a zone with holiday changes into actual dates', async () => {
    const holiday = fakeHttp((url) =>
      json({
        features: url.pathname.includes('/0/')
          ? [
              {
                attributes: {
                  ...zone('General Waste', 'Red', 1, 0).attributes,
                  Exclusion: '2026-12-25, 2026-01-02',
                  Additional: '2026-12-26',
                },
              },
            ]
          : [],
      }),
    );
    const schedule = await council.getSchedule(
      { ...address, latitude: -35.14, longitude: 138.47 },
      ctx(holiday, '2026-12-10'),
    );
    expect(schedule.services[0]?.recurrence).toEqual({
      kind: 'dates',
      dates: ['2026-12-11', '2026-12-18', '2026-12-26'],
    });
  });

  it('needs coordinates, and says so when no zone covers the point', async () => {
    await expect(council.getSchedule(address, ctx(http()))).rejects.toMatchObject({
      code: 'INVALID_INPUT',
    });
    const empty = fakeHttp(() => json({ features: [] }));
    await expect(
      council.getSchedule({ ...address, latitude: -30, longitude: 135 }, ctx(empty)),
    ).rejects.toMatchObject({ code: 'ADDRESS_NOT_FOUND' });
  });
});
