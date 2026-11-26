import { describe, expect, it } from 'vitest';
import { parseAnswer } from '../../src/councils/qld/toowoomba.js';
import { recurrences } from '../helpers.js';

// Wording as Toowoomba's form gave it on 2026-11-26, after its HTML is stripped.
const answer = (bins: string) =>
  `Address: 112 Example Street TOOWOOMBA CITY QLD 4350 This weeks collection: ${bins} This weeks collection date: Monday 23/11/2026`;

describe('Toowoomba adapter', () => {
  it("puts recycling in this week when it is one of this week's bins", () => {
    expect(recurrences({ services: parseAnswer(answer('General & Recycle')) })).toEqual([
      ['general', { kind: 'interval', everyDays: 7, anchor: '2026-11-23' }],
      ['recycling', { kind: 'interval', everyDays: 14, anchor: '2026-11-23' }],
    ]);
  });

  it('otherwise puts recycling next week, and shows a green bin only when it is named', () => {
    const services = parseAnswer(answer('General & Green'));
    expect(recurrences({ services })).toEqual([
      ['general', { kind: 'interval', everyDays: 7, anchor: '2026-11-23' }],
      ['recycling', { kind: 'interval', everyDays: 14, anchor: '2026-11-30' }],
      ['organics', { kind: 'interval', everyDays: 14, anchor: '2026-11-23' }],
    ]);
    expect(services[2]?.optional).toBe(true);
  });

  it('finds nothing in an answer without a date', () => {
    expect(parseAnswer('Sorry, an unexpected error occurred.')).toEqual([]);
  });
});
