import { describe, expect, it } from 'vitest';
import { parseAustralianAddress } from '../../src/core/address.js';
import { sunshineCoast } from '../../src/councils/qld/sunshine-coast.js';
import { ctx, fakeHttp, json } from '../helpers.js';

// As sunshinecoast.qld.gov.au answered a search for "Bulcock" on 2026-11-10.
const streets = [
  { street: 'Bulcock St', locality: 'Caloundra', day: 'Friday', week: '2' },
  { street: 'Esplanade Bulcock Beach', locality: 'Caloundra', day: 'Friday', week: '2' },
];
const lookup = (input: string, found = streets) =>
  sunshineCoast.getSchedule(
    { input, parts: parseAustralianAddress(input) },
    ctx(fakeHttp(() => json(found))),
  );

describe('Sunshine Coast adapter', () => {
  it("works the fortnights out from the street's week, as the council's page does", async () => {
    const schedule = await lookup('12 Bulcock Street, Caloundra QLD');
    expect(schedule.matchedAddress).toBe('Bulcock St, Caloundra');
    expect(schedule.services.map((s) => [s.type, s.recurrence])).toEqual([
      ['general', { kind: 'interval', everyDays: 7, anchor: '2026-11-13' }],
      // A week 2 street: recycling from Friday 24 December 2021, which lands on 20 November 2026.
      ['recycling', { kind: 'interval', everyDays: 14, anchor: '2021-12-24' }],
      ['organics', { kind: 'interval', everyDays: 14, anchor: '2021-12-31' }],
    ]);
  });

  it('asks which suburb when a street name has different days in two', async () => {
    const twice = [streets[0]!, { ...streets[0]!, locality: 'Nambour', day: 'Monday' }];
    await expect(lookup('12 Bulcock St, Maleny QLD', twice)).rejects.toMatchObject({
      code: 'ADDRESS_NOT_FOUND',
      details: { suggestions: ['Bulcock St, Caloundra', 'Bulcock St, Nambour'] },
    });
    expect((await lookup('12 Bulcock St, Nambour QLD', twice)).matchedAddress).toContain('Nambour');
  });
});
