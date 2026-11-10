import { describe, expect, it } from 'vitest';
import { parseAustralianAddress } from '../../src/core/address.js';
import { stirling } from '../../src/councils/wa/stirling.js';
import { ctx, fakeHttp, json } from '../helpers.js';

const row = (type: string, date: string) => [
  { name: 'type', value: type },
  { name: 'day', value: 'Tuesday' },
  { name: 'date', value: date },
];
// The answer for a house on 2026-11-10, and for a point with no collection.
const house = [
  row('Red', 'Nov 10 2026 '),
  row('Yellow', 'Nov 17 2026 '),
  row('Green', 'Nov 10 2026 '),
  row('GreenVerge', '27 Apr 2026'),
];
const nowhere = [row('Red', '-'), row('Yellow', '-'), row('Green', '-'), row('GreenVerge', '')];

const input = '1 Example Street, Stirling WA';
const address = {
  input,
  parts: parseAustralianAddress(input),
  latitude: -31.902,
  longitude: 115.8234,
};

describe('Stirling adapter', () => {
  it("asks for the address's location and reads each bin's next date", async () => {
    let fields: string | null = null;
    const http = fakeHttp((_, init) => {
      fields = new Headers(init?.headers).get('fields');
      // The council sometimes sends its JSON wrapped in a string.
      return json(JSON.stringify(house));
    });
    const schedule = await stirling.getSchedule(address, ctx(http));
    expect(fields).toBe('115.8234,-31.902');
    expect(schedule.services.map((s) => [s.type, s.recurrence])).toEqual([
      ['general', { kind: 'interval', everyDays: 7, anchor: '2026-11-10' }],
      ['recycling', { kind: 'interval', everyDays: 14, anchor: '2026-11-17' }],
      ['organics', { kind: 'interval', everyDays: 14, anchor: '2026-11-10' }],
      ['bulky', { kind: 'dates', dates: ['2026-04-27'] }],
    ]);
  });

  it('reports a point with no collection', async () => {
    await expect(
      stirling.getSchedule(address, ctx(fakeHttp(() => json(nowhere)))),
    ).rejects.toMatchObject({ code: 'ADDRESS_NOT_FOUND' });
  });
});
