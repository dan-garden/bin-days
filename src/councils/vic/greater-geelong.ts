import * as cheerio from 'cheerio';
import { pickAddress, searchLine } from '../../core/address.js';
import { classifyBin } from '../../core/bin-types.js';
import { parseAustralianDate } from '../../core/date.js';
import { parseError } from '../../core/errors.js';
import { getJson, getText } from '../../core/http.js';
import { binService, parseFrequency } from '../../core/schedule.js';
import type { BinService } from '../../core/types.js';
import type { CouncilAdapter } from '../types.js';

/**
 * City of Greater Geelong, via its bin collection calendar: one call suggests
 * addresses, then the calendar's form is filled in as a visitor would, which
 * needs the form's hidden fields and the session cookie the page sets.
 */
const APP = 'https://app.geelongcity.vic.gov.au';
const FORM = `${APP}/recycling/calendar/default.aspx`;
const RESULT = `${APP}/recycling/calendar/result.aspx`;

/**
 * Each bin on the result page: a heading such as "Recycling (fortnightly)", then its next
 * four dates ("Tuesday, 24 November 2026"). Exported for tests.
 */
export function parseBins(html: string): BinService[] {
  const $ = cheerio.load(html);
  const services: BinService[] = [];
  $('h3').each((_, heading) => {
    const [name = '', cycle = ''] = $(heading).text().trim().split(/\s*\(/);
    const date = parseAustralianDate($(heading).nextAll('ul').first().find('li').first().text());
    if (date) services.push(binService(classifyBin(name), name, date, parseFrequency(cycle)));
  });
  return services;
}

export const greaterGeelong: CouncilAdapter = {
  id: 'vic/greater-geelong',
  name: 'City of Greater Geelong',
  state: 'VIC',
  lgaCodes: ['22750'],
  timezone: 'Australia/Melbourne',
  website: 'https://www.geelongaustralia.com.au',
  platform: 'council-api',
  async getSchedule(address, { http }) {
    const found = await getJson<{ d?: string[] }>(
      http,
      `${APP}/App_Service/searchWCC.asmx/GetWCC`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ prefixText: searchLine(address, this.name), count: 10 }),
      },
    );
    // "12 Example Street Geelong 3220"
    const property = pickAddress(found.d ?? [], (line) => line, address, this.name);

    const page = await http.fetch(FORM);
    const cookie = page.headers
      .getSetCookie()
      .map((entry) => entry.split(';')[0])
      .join('; ');
    const $ = cheerio.load(await page.text());
    const form = new URLSearchParams({
      ctl00$ContentBody$TB_SEARCH: property,
      ctl00$ContentBody$BTN_SEARCH: 'Search',
    });
    $('input[type=hidden]').each((_, input) => {
      form.set($(input).attr('name') ?? '', $(input).attr('value') ?? '');
    });
    // The form answers with a redirect to the result page, which is read with the same cookie.
    await http.fetch(FORM, { method: 'POST', headers: { cookie }, body: form, redirect: 'manual' });
    const services = parseBins(await getText(http, RESULT, { headers: { cookie } }));
    if (!services.length) throw parseError(`No bin services found for ${property}`, { url: FORM });
    return { matchedAddress: property, services, sourceUrl: FORM };
  },
};
