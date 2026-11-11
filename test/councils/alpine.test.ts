import { describe, expect, it } from 'vitest';
import { alpine, parseAnswer } from '../../src/councils/vic/alpine.js';
import { ctx, fakeHttp, json, recurrences, resolved } from '../helpers.js';

// Markup as alpineshire.vic.gov.au returned it on 2026-11-11.
const field = (name: string, sentence: string) =>
  `<div class="views-field views-field-${name}"><p class="field-content">${sentence}</p></div>`;
const row = (address: string) =>
  `<div class="views-row">${field('address', `Collection details for ${address}`)}${field('waste-day', 'Your next waste collection is in 13 days on Tuesday 24th November 2026.')}${field('recycling-day', 'Your next recycling collection is in 6 days on Tuesday 17th November 2026.')}${field('fogo-day', 'No service')}</div>`;

describe('Alpine adapter', () => {
  it("reads each bin's next date, leaving out one the property doesn't have", () => {
    const answer = parseAnswer(row('30 EXAMPLE STREET BRIGHT'));
    expect(answer.address).toBe('30 EXAMPLE STREET BRIGHT');
    expect(recurrences(answer)).toEqual([
      ['general', { kind: 'interval', everyDays: 14, anchor: '2026-11-24' }],
      ['recycling', { kind: 'interval', everyDays: 14, anchor: '2026-11-17' }],
    ]);
  });

  it('refuses an answer that is for a different house', async () => {
    // The lookup matches "2 Example Street" inside "12 Example Street" and answers for that.
    const http = fakeHttp((url) =>
      url.pathname.startsWith('/views-autocomplete-filters')
        ? json([{ value: '2 EXAMPLE STREET BRIGHT 3741' }])
        : json([{ command: 'insert', data: row('12 EXAMPLE STREET BRIGHT') }]),
    );
    await expect(
      alpine.getSchedule(resolved('2 Example Street, Bright VIC'), ctx(http)),
    ).rejects.toMatchObject({ code: 'ADDRESS_NOT_FOUND' });
  });
});
