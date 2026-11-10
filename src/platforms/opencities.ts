import * as cheerio from 'cheerio';
import { z } from 'zod';
import { formatStreetLine, matchesHouseNumber } from '../core/address.js';
import { classifyBin, DEFAULT_COLOURS } from '../core/bin-types.js';
import { nextWeekday, parseAustralianDate } from '../core/date.js';
import { addressNotFound, parseError, upstreamError } from '../core/errors.js';
import { getJson, type HttpClient } from '../core/http.js';
import { parseFrequency } from '../core/schedule.js';
import type {
  BinService,
  BinType,
  CouncilSchedule,
  LocalDate,
  ResolvedAddress,
} from '../core/types.js';
import type { CouncilAdapter, CouncilInfo } from '../councils/types.js';

/**
 * Adapter for councils whose website runs on Granicus OpenCities, a CMS used
 * by many Australian councils. They expose two endpoints:
 *
 *   GET {base}/api/v1/myarea/search?keywords=<address>
 *     -> { Items: [{ Id, AddressSingleLine, ... }] }
 *   GET {base}/ocapi/Public/myarea/wasteservices?geolocationid=<Id>&ocsvclang=en-AU
 *     -> { success, responseContent: "<html widget>" }
 *
 * The widget HTML lists each service with its frequency and next date.
 *
 * How to tell if a council uses OpenCities: its site footer usually links to
 * granicus.com/solution/govaccess/opencities, and the search URL above returns JSON.
 */
export interface OpenCitiesConfig extends Omit<CouncilInfo, 'platform'> {
  /** e.g. `https://www.goldcoast.qld.gov.au` */
  baseUrl: string;
  /**
   * The council's bin-day page. Some OpenCities sites only answer the
   * waste-services call with a session cookie from this page, so it is
   * fetched and the call retried if the first attempt fails.
   */
  sessionPagePath?: string;
  /** Map council labels to bin types where the default classifier gets it wrong. */
  binTypes?: Record<string, BinType>;
  /** Lid colours by bin type, if they differ from the Australian defaults. */
  colours?: Partial<Record<BinType, string>>;
}

const SearchResponse = z.object({
  Items: z
    .array(
      z.object({
        Id: z.string(),
        AddressSingleLine: z.string(),
        LatLon: z.array(z.number()).optional().nullable(),
      }),
    )
    .default([]),
});

const WasteResponse = z.object({
  success: z.boolean(),
  responseContent: z.string().optional().nullable(),
});

export function createOpenCitiesCouncil(config: OpenCitiesConfig): CouncilAdapter {
  const { baseUrl, sessionPagePath, binTypes = {}, colours = {}, ...council } = config;
  const base = baseUrl.replace(/\/$/, '');
  const info = { website: base, ...council };

  async function search(http: HttpClient, keywords: string) {
    const url = `${base}/api/v1/myarea/search?keywords=${encodeURIComponent(keywords)}`;
    const json = await getJson(http, url, { headers: { accept: 'application/json' } });
    const parsed = SearchResponse.safeParse(json);
    if (!parsed.success) throw parseError(`Unexpected search response from ${info.name}`, { url });
    return parsed.data.Items;
  }

  async function findProperty(http: HttpClient, address: ResolvedAddress) {
    const { parts } = address;
    const suburb = parts.suburb ?? '';
    // OpenCities search is fuzzy but returns nothing if you include the state,
    // postcode or country, so try a few clean variants in order.
    const queries = unique([
      parts.unit && `${formatStreetLine(parts, { includeUnit: true })} ${suburb}`,
      `${formatStreetLine(parts)} ${suburb}`,
      `${formatStreetLine(parts, { abbreviate: true })} ${suburb}`,
      formatStreetLine(parts),
    ]);

    const suggestions = new Set<string>();
    for (const query of queries) {
      const items = await search(http, query);
      items.slice(0, 5).forEach((i) => {
        suggestions.add(i.AddressSingleLine);
      });
      const matches = items.filter((item) => matchesHouseNumber(item.AddressSingleLine, parts));
      // The last query drops the suburb in case the user named the wrong one.
      // Only trust it if every hit is on the same street in the same suburb; otherwise suggest.
      // (Compared without the unit and house number, because councils write the
      // rest differently: "Main St, UPWEY 3158" or "Main Street UPWEY VIC 3158".)
      const places = new Set(matches.map((m) => restOfAddress(m.AddressSingleLine)));
      if (matches[0] && (query.endsWith(` ${suburb}`) || places.size === 1)) return matches[0];
    }
    throw addressNotFound(`${info.name} could not find "${address.input}"`, {
      suggestions: [...suggestions].slice(0, 5),
    });
  }

  async function fetchWasteServices(http: HttpClient, geolocationId: string) {
    const url = `${base}/ocapi/Public/myarea/wasteservices?geolocationid=${encodeURIComponent(geolocationId)}&ocsvclang=en-AU`;
    const headers: Record<string, string> = {
      accept: 'application/json',
      'x-requested-with': 'XMLHttpRequest',
    };

    const attempt = async () => {
      const parsed = WasteResponse.safeParse(await getJson(http, url, { headers }));
      return parsed.success && parsed.data.success ? parsed.data.responseContent : undefined;
    };

    let html = await attempt().catch(() => undefined);
    if (html == null && sessionPagePath) {
      const page = await http.fetch(`${base}${sessionPagePath}`);
      const cookies = page.headers.getSetCookie().map((c) => c.split(';')[0]);
      if (cookies.length) headers.cookie = cookies.join('; ');
      html = await attempt();
    }
    if (html == null) throw upstreamError(`${info.name} did not return waste services`, { url });
    return { html, url };
  }

  return {
    ...info,
    platform: 'opencities',
    async getSchedule(address, { http, today }) {
      const property = await findProperty(http, address);
      const { html, url } = await fetchWasteServices(http, property.Id);
      const services = parseOpenCitiesWasteServices(html, { binTypes, colours, today });
      if (!services.length) {
        throw parseError(`No bin services found for ${property.AddressSingleLine}`, { url });
      }
      return {
        matchedAddress: property.AddressSingleLine,
        propertyId: property.Id,
        services,
        sourceUrl: url,
      } satisfies CouncilSchedule;
    },
  };
}

/** Parse the OpenCities waste-services widget HTML. Exported for tests. */
export function parseOpenCitiesWasteServices(
  html: string,
  options: {
    binTypes?: Record<string, BinType>;
    colours?: Partial<Record<BinType, string>>;
    /** Needed for councils that name a weekday ("Thursday") instead of giving a date. */
    today?: LocalDate;
  } = {},
): BinService[] {
  const $ = cheerio.load(html);
  const services: BinService[] = [];

  $('.waste-services-result').each((_, el) => {
    const $el = $(el);
    const name = $el.find('h3').first().text().trim();
    const dateText = $el.find('.next-service').first().text().trim();
    const frequencyText = $el.find('.subheading').first().text() || $el.find('.note').text();
    const type = classifyBin(name, options.binTypes);
    // The widget also lists things that aren't bins (street sweeping, links to calendars).
    if (type === 'other') return;
    // Some councils put the cycle in the name ("Weekly red-lidded garbage bin collection").
    // Bulky collections are one-off dates, whatever their description says about weeks.
    const everyDays =
      type === 'bulky'
        ? undefined
        : (parseFrequency(frequencyText) ?? parseFrequency(name) ?? parseFrequency(dateText));
    const next = parseAustralianDate(dateText) ?? weekdayOnly(dateText, everyDays, options.today);
    if (!name || !next) return;

    const colour = options.colours?.[type] ?? DEFAULT_COLOURS[type];

    services.push({
      type,
      name,
      ...(colour ? { colour } : {}),
      recurrence: everyDays
        ? { kind: 'interval', everyDays, anchor: next }
        : { kind: 'dates', dates: [next] },
    });
  });

  return services;
}

/**
 * Some councils show only "Thursday" or "Every Tuesday". For a weekly bin that
 * pins the next date down; for a fortnightly one it doesn't say which week, so
 * it is left out.
 */
function weekdayOnly(text: string, everyDays?: number, today?: LocalDate): LocalDate | undefined {
  const [, every, name] = /^(every\s+)?([a-z]+day)$/i.exec(text) ?? [];
  return today && name && (every || everyDays === 7) ? nextWeekday(name, today) : undefined;
}

/** An address line without its leading unit and house number, for comparing places. */
function restOfAddress(line: string): string {
  return line
    .replace(/^\s*(unit\s+)?[\d/\-a-z]*\d[\d/\-a-z]*\s+/i, '')
    .replace(/\s+/g, ' ')
    .toUpperCase();
}

function unique(values: Array<string | undefined | false>): string[] {
  return [...new Set(values.filter((v): v is string => !!v && !!v.trim()).map((v) => v.trim()))];
}
