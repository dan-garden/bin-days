import * as cheerio from 'cheerio';
import { formatStreetLine, preferSuburb } from '../../core/address.js';
import { classifyBin } from '../../core/bin-types.js';
import { parseAustralianDate } from '../../core/date.js';
import { addressNotFound, invalidInput, parseError } from '../../core/errors.js';
import { getJson, getText } from '../../core/http.js';
import { parseFrequency } from '../../core/schedule.js';
import type { BinService } from '../../core/types.js';
import type { CouncilAdapter } from '../types.js';

/**
 * Central Coast Council (NSW), via 1Coast, the council's waste services site.
 * A search finds the property and its collection codes, and a page for those
 * codes lists each bin with its cycle and next date.
 */
const SITE = 'https://1coast.com.au';

interface Property {
  id: string;
  /** House number, street ("MANN ST"), suburb, "CENTRAL COAST", postcode. */
  name: string[];
  collection: { frequency: string; day: string };
}

/** The bins on a collection page. Exported for tests. */
export function parseCollectionPage(html: string): BinService[] {
  const $ = cheerio.load(html);
  const services: BinService[] = [];
  $('.booking-list--collection-details').each((_, element) => {
    const name = $(element).find('.booking-list--legend-wrapper').text().trim();
    const after = (label: string) =>
      $(element)
        .find('span')
        .filter((_, span) => $(span).text().trim() === label)
        .next('span')
        .text();
    // Written "Thu, 12-Nov-2026".
    const next = parseAustralianDate(after('Next Collection').replace(/-/g, ' '));
    if (!name || !next) return;
    const everyDays = parseFrequency(after('Frequency'));
    const colour = $(element).find('.legend').attr('class')?.replace('legend', '').trim();
    services.push({
      type: classifyBin(name),
      name,
      ...(colour ? { colour } : {}),
      recurrence: everyDays
        ? { kind: 'interval', everyDays, anchor: next }
        : { kind: 'dates', dates: [next] },
    });
  });
  return services;
}

export const centralCoast: CouncilAdapter = {
  id: 'nsw/central-coast',
  name: 'Central Coast Council',
  state: 'NSW',
  lgaCodes: ['11650'],
  timezone: 'Australia/Sydney',
  website: SITE,
  platform: 'council-api',

  async getSchedule(address, { http }) {
    const { parts } = address;
    if (!parts.houseNumber || !parts.street) {
      throw invalidInput('Central Coast lookups need a house number and street', { parts });
    }
    const line = formatStreetLine(parts, { abbreviate: true, includeUnit: true });
    const searchUrl = `${SITE}/ajax.php?${new URLSearchParams({ a: 'search', s: line })}`;
    const properties = await getJson<Property[]>(http, searchUrl);
    if (!Array.isArray(properties)) {
      throw parseError('Unexpected response from 1coast.com.au', { url: searchUrl });
    }

    const candidates = preferSuburb(
      properties.filter((p) => `${p.name[0]} ${p.name[1]}`.toLowerCase() === line.toLowerCase()),
      (p) => p.name[2] ?? '',
      parts.suburb,
    );
    const property = candidates[0];
    if (!property || candidates.length > 1) {
      throw addressNotFound(`Central Coast Council has no property matching "${address.input}"`, {
        suggestions: (candidates.length ? candidates : properties)
          .slice(0, 5)
          .map((p) => p.name.join(' ')),
      });
    }

    const url = `${SITE}/bin-collection/bin-collection-day-address-details/?${new URLSearchParams({
      a: 'unauth-address-search',
      address: property.id,
      'collection[frequency]': property.collection.frequency,
      'collection[day]': property.collection.day,
    })}`;
    const services = parseCollectionPage(await getText(http, url));
    const matchedAddress = property.name.join(' ');
    if (!services.length) throw parseError(`No bin services found for ${matchedAddress}`, { url });
    return { matchedAddress, services, sourceUrl: url };
  },
};
