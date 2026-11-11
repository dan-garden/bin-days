import { describe, expect, it } from 'vitest';
import { glenorchy } from '../../src/councils/tas/glenorchy.js';
import { ctx, fakeHttp, json, recurrences, resolved } from '../helpers.js';

describe('Glenorchy adapter', () => {
  it('finds the property, then reads each bin from its seed date and cycle', async () => {
    // Shapes as gcc.tas.gov.au returned them on 2026-11-11.
    const property = { PID: 5395929, Address: '12 Example Street, Glenorchy  TAS  7010' };
    const service = (ServiceType: string) => ({
      properties: { ...property, ServiceType, SeedDate: '2020-02-10', Days: 14 },
    });
    const bodies: string[] = [];
    const http = fakeHttp((_url, init) => {
      bodies.push(String(init?.body));
      return bodies.length === 1
        ? json({ features: [{ properties: property }, { properties: property }] })
        : json({ features: [service('Garbage'), service('Recycling')] });
    });
    const schedule = await glenorchy.getSchedule(
      resolved('12 Example St, Glenorchy TAS'),
      ctx(http),
    );
    expect(bodies).toEqual(['{"address":"12 Example Street"}', '{"pid":"5395929"}']);
    expect(recurrences(schedule)).toEqual([
      ['general', { kind: 'interval', everyDays: 14, anchor: '2020-02-10' }],
      ['recycling', { kind: 'interval', everyDays: 14, anchor: '2020-02-10' }],
    ]);
  });
});
