import { describe, expect, it } from 'vitest';
import { parseBins } from '../../src/councils/vic/mansfield.js';
import { recurrences } from '../helpers.js';

describe('Mansfield adapter', () => {
  it("reads each bin's next date off the page", () => {
    // Markup as mansfield.vic.gov.au returned it on 2026-11-11.
    const block = (name: string, alias: string, date: string) =>
      `<div><h4>${name}</h4><div class="info ${alias}"><p>Ensure bins are put out the night before.</p><p>${date}</p></div></div>`;
    const html = `<div class="waste-schedule-results">${block('General waste', 'general_waste_api_alias', 'Fri 13/11/2026')}${block('Recycling', 'recycling_api_alias', 'Fri 13/11/2026')}${block('Green Bin', 'green_bin_api_alias', 'Fri 20/11/2026')}</div>`;
    expect(recurrences({ services: parseBins(html) })).toEqual([
      ['general', { kind: 'interval', everyDays: 7, anchor: '2026-11-13' }],
      ['recycling', { kind: 'interval', everyDays: 14, anchor: '2026-11-13' }],
      ['organics', { kind: 'interval', everyDays: 14, anchor: '2026-11-20' }],
    ]);
  });
});
