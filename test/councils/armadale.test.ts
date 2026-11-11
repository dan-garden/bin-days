import { describe, expect, it } from 'vitest';
import { armadale } from '../../src/councils/wa/armadale.js';
import { ctx, fakeHttp, json, recurrences, resolved } from '../helpers.js';

describe('Armadale adapter', () => {
  // Shapes as api.my.armadale.wa.gov.au returned them on 2026-11-11.
  const lookup = (recycle_area: string) => {
    const http = fakeHttp(() =>
      json([{ address: '7 Example Avenue, ARMADALE', bin_day: 'Friday', recycle_area }]),
    );
    return armadale.getSchedule(resolved('7 Example Ave, Armadale WA'), ctx(http, '2026-11-11'));
  };

  it('puts recycling in this week or next, as the council says', async () => {
    expect(recurrences(await lookup('This Week (Area 2)'))).toEqual([
      ['general', { kind: 'interval', everyDays: 7, anchor: '2026-11-13' }],
      ['recycling', { kind: 'interval', everyDays: 14, anchor: '2026-11-13' }],
    ]);
    expect(recurrences(await lookup('Next Week (Area 1)'))).toEqual([
      ['general', { kind: 'interval', everyDays: 7, anchor: '2026-11-13' }],
      ['recycling', { kind: 'interval', everyDays: 14, anchor: '2026-11-20' }],
    ]);
  });
});
