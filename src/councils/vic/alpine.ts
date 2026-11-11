import * as cheerio from 'cheerio';
import { pickAddress, searchLine } from '../../core/address.js';
import { parseAustralianDate } from '../../core/date.js';
import { addressNotFound, parseError } from '../../core/errors.js';
import { getJson } from '../../core/http.js';
import { binService } from '../../core/schedule.js';
import type { BinService } from '../../core/types.js';
import type { CouncilAdapter } from '../types.js';

/**
 * Alpine Shire Council, via the two calls behind its address lookup: one
 * suggests addresses, the other returns a piece of the page with each bin's next date.
 */
const SITE = 'https://www.alpineshire.vic.gov.au';

/** Where each bin's date is in the answer, and its cycle as the council's waste pages give it. */
const BINS = [
  { block: '.views-field-waste-day', type: 'general', name: 'General waste', everyDays: 14 },
  { block: '.views-field-recycling-day', type: 'recycling', name: 'Recycling', everyDays: 14 },
  { block: '.views-field-fogo-day', type: 'organics', name: 'FOGO', everyDays: 7 },
] as const;

/**
 * The address the answer is for, and each bin's next date ("... on Tuesday 24th November
 * 2026."). A bin the property doesn't have reads "No service". Exported for tests.
 */
export function parseAnswer(html: string): { address: string; services: BinService[] } {
  const $ = cheerio.load(html);
  const services: BinService[] = [];
  for (const bin of BINS) {
    const date = parseAustralianDate($(bin.block).first().text());
    if (date) services.push(binService(bin.type, bin.name, date, bin.everyDays));
  }
  const address = $('.views-field-address').first().text().replace('Collection details for', '');
  return { address: address.trim(), services };
}

export const alpine: CouncilAdapter = {
  id: 'vic/alpine',
  name: 'Alpine Shire Council',
  state: 'VIC',
  lgaCodes: ['20110'],
  timezone: 'Australia/Melbourne',
  website: 'https://www.alpineshire.vic.gov.au',
  platform: 'council-api',
  async getSchedule(address, { http }) {
    const search = `${SITE}/views-autocomplete-filters/address_lookup/block_1/ezi_address/0?${new URLSearchParams(
      { q: searchLine(address, this.name, { includeUnit: true }) },
    )}`;
    const results = await getJson<Array<{ value: string }>>(http, search);
    // "12 EXAMPLE STREET BRIGHT 3741"
    const property = pickAddress(results, (r) => r.value, address, this.name).value;

    const url = `${SITE}/views/ajax?${new URLSearchParams({
      view_name: 'address_lookup',
      view_display_id: 'block_1',
      address: property,
      _wrapper_format: 'drupal_ajax',
    })}`;
    const commands = await getJson<Array<{ command?: string; data?: string }>>(http, url);
    const html = commands.find((c) => c.command === 'insert' && c.data?.includes('views-row'));
    const answer = parseAnswer(html?.data ?? '');
    // The lookup matches any address containing the text and answers for the first, so
    // "2 Example Avenue" can come back as number 12. Only its own answer is used.
    if (!answer.address || !property.startsWith(answer.address)) {
      throw addressNotFound(`${this.name} has no collection details for "${address.input}"`);
    }
    if (!answer.services.length) {
      throw parseError(`No bin services found for ${property}`, { url });
    }
    return { matchedAddress: property, services: answer.services, sourceUrl: url };
  },
};
