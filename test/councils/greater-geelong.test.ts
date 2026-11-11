import { describe, expect, it } from 'vitest';
import { greaterGeelong, parseBins } from '../../src/councils/vic/greater-geelong.js';
import { ctx, fakeHttp, json, recurrences, resolved, text } from '../helpers.js';

// Markup as app.geelongcity.vic.gov.au returned it on 2026-11-11.
const bin = (heading: string, dates: string[]) =>
  `<h3 class="heading-icon"><span></span>${heading}</h3><ul>${dates.map((date) => `<li> ${date}</li>`).join('')}</ul>`;
const result = `<h2>Next four collection dates:</h2>${bin('Garbage (weekly)', ['Tuesday, 17 November 2026', 'Tuesday, 24 November 2026'])}${bin('Recycling (fortnightly)', ['Tuesday, 24 November 2026'])}${bin('Green waste (fortnightly)', ['Tuesday, 17 November 2026'])}`;

describe('Greater Geelong adapter', () => {
  it("reads each bin's cycle and first date off the result page", () => {
    expect(recurrences({ services: parseBins(result) })).toEqual([
      ['general', { kind: 'interval', everyDays: 7, anchor: '2026-11-17' }],
      ['recycling', { kind: 'interval', everyDays: 14, anchor: '2026-11-24' }],
      ['organics', { kind: 'interval', everyDays: 14, anchor: '2026-11-17' }],
    ]);
  });

  it("fills in the calendar's form with its hidden fields and session cookie", async () => {
    const sent: Array<{ cookie: string | null; body: string }> = [];
    const http = fakeHttp((url, init) => {
      if (url.pathname.endsWith('/GetWCC')) return json({ d: ['30 Example Street Geelong 3220'] });
      sent.push({
        cookie: new Headers(init?.headers).get('cookie'),
        body: String(init?.body ?? ''),
      });
      if (url.pathname.endsWith('/result.aspx')) return text(result);
      return new Response('<input type="hidden" name="__VIEWSTATE" value="abc" />', {
        headers: { 'set-cookie': 'ASP.NET_SessionId=s1; path=/; HttpOnly' },
      });
    });
    const schedule = await greaterGeelong.getSchedule(
      resolved('30 Example St, Geelong VIC'),
      ctx(http),
    );
    expect(sent[1]?.cookie).toBe('ASP.NET_SessionId=s1');
    expect(sent[1]?.body).toContain('__VIEWSTATE=abc');
    expect(sent[1]?.body).toContain('TB_SEARCH=30+Example+Street+Geelong+3220');
    expect(sent[2]?.cookie).toBe('ASP.NET_SessionId=s1');
    expect(schedule.services).toHaveLength(3);
  });
});
