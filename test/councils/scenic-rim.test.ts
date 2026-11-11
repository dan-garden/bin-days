import { describe, expect, it } from 'vitest';
import { scenicRim } from '../../src/councils/qld/scenic-rim.js';
import { ctx, fakeHttp, recurrences, resolved, text } from '../helpers.js';

// Rows as the council's file had them on 2026-11-11.
const file = [
  'Street_Address,Street,Street_Locality,Service_Day,Recycle_Week',
  '1 Example Street BEAUDESERT  QLD 4285,Example Street,BEAUDESERT,Thursday,Week1 Red',
  '103 Example Street BEAUDESERT  QLD 4285,Example Street,BEAUDESERT,Tuesday,Week2 Blue',
  '5 Other Road ARATULA  QLD 4309,Other Road,ARATULA,Monday,Contact Council',
].join('\r\n');

describe('Scenic Rim adapter', () => {
  const lookup = (input: string) =>
    scenicRim.getSchedule(
      resolved(input),
      ctx(
        fakeHttp(() => text(file)),
        '2026-11-11',
      ),
    );

  it("counts a property's recycling fortnight from its colour's week", async () => {
    const schedule = await lookup('103 Example St, Beaudesert QLD');
    expect(schedule.matchedAddress).toBe('103 Example Street BEAUDESERT QLD 4285');
    expect(recurrences(schedule)).toEqual([
      ['general', { kind: 'interval', everyDays: 7, anchor: '2026-11-17' }],
      ['recycling', { kind: 'interval', everyDays: 14, anchor: '2022-08-02' }],
    ]);
    expect(recurrences(await lookup('1 Example St, Beaudesert QLD'))[1]).toEqual([
      'recycling',
      { kind: 'interval', everyDays: 14, anchor: '2022-08-11' },
    ]);
  });

  it('gives only general waste where the council says to contact it', async () => {
    expect(recurrences(await lookup('5 Other Rd, Aratula QLD'))).toEqual([
      ['general', { kind: 'interval', everyDays: 7, anchor: '2026-11-16' }],
    ]);
  });
});
