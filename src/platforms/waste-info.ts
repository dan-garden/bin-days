import { z } from 'zod';
import { expandStreetType, matchesHouseNumber, preferSuburb } from '../core/address.js';
import { DEFAULT_COLOURS } from '../core/bin-types.js';
import { memoize } from '../core/cache.js';
import { addDays, isLocalDate } from '../core/date.js';
import { addressNotFound, parseError } from '../core/errors.js';
import { getJson, type HttpClient } from '../core/http.js';
import type { BinService, BinType, CouncilSchedule } from '../core/types.js';
import type { CouncilAdapter, CouncilInfo } from '../councils/types.js';

/**
 * Adapter for councils whose bin calendar runs on waste-info.com.au (Impact
 * Apps), each on its own subdomain:
 *
 *   GET https://<council>.waste-info.com.au/api/v1/streets.json
 *     -> { streets: [{ id, name: "Abelia Street", locality: "Alexandra Hills" }] }
 *   GET .../properties.json?street=<id>
 *     -> { properties: [{ id, name: "4 Abelia Street Alexandra Hills" }] }
 *   GET .../properties/<id>.json?start=YYYY-MM-DD&end=YYYY-MM-DD
 *     -> [{ event_type: "waste", start_date, daysOfWeek }, { event_type: "recycle", start }, ...]
 *
 * How to tell if a council uses it: `https://<council>.waste-info.com.au/api/v1/streets.json`
 * returns JSON. The council's own website is often bot-protected; this host is not.
 */
export interface WasteInfoConfig extends Omit<CouncilInfo, 'platform'> {
  /** The `<council>` in `<council>.waste-info.com.au`, e.g. `redland`. */
  subdomain: string;
  /** Lid colours by bin type, if they differ from the Australian defaults. */
  colours?: Partial<Record<BinType, string>>;
}

const StreetsResponse = z.object({
  streets: z.array(z.object({ id: z.number(), name: z.string(), locality: z.string() })),
});
type Street = z.infer<typeof StreetsResponse>['streets'][number];

const PropertiesResponse = z.object({
  properties: z.array(z.object({ id: z.number(), name: z.string() })),
});

const EventsResponse = z.array(
  z.object({
    event_type: z.string(),
    /** One collection on this date. */
    start: z.string().optional(),
    /** A weekly collection starting on this date. */
    start_date: z.string().optional(),
  }),
);

/** The platform's event types. Anything else ("special" drop-off days etc.) isn't a bin. */
const BINS: Record<string, { type: BinType; name: string; colour?: string }> = {
  waste: { type: 'general', name: 'General waste' },
  recycle: { type: 'recycling', name: 'Recycling' },
  paper: { type: 'recycling', name: 'Paper and cardboard', colour: 'blue' },
  organic: { type: 'organics', name: 'Organics' },
  greenwaste: { type: 'organics', name: 'Garden waste' },
  glass: { type: 'glass', name: 'Glass' },
  clean_up: { type: 'bulky', name: 'Kerbside clean-up' },
};

const DAY = 24 * 3_600_000;
/** The service layer caps requests at 366 days, so one fetch covers any range from today. */
const HORIZON_DAYS = 366;

export function createWasteInfoCouncil(config: WasteInfoConfig): CouncilAdapter {
  const { subdomain, colours = {}, ...council } = config;
  const site = `https://${subdomain}.waste-info.com.au`;
  // The waste-info site is the council's public bin calendar, so it's the default website.
  const info = { website: site, ...council };
  const api = `${site}/api/v1`;

  async function get<T>(http: HttpClient, path: string, shape: z.ZodType<T>): Promise<T> {
    const url = `${api}/${path}`;
    const parsed = shape.safeParse(await getJson(http, url));
    if (!parsed.success) throw parseError(`Unexpected response from ${info.name}`, { url });
    return parsed.data;
  }

  return {
    ...info,
    platform: 'waste-info',
    async getSchedule(address, { http, cache, today }) {
      const { parts } = address;
      const notFound = (suggestions: string[]) =>
        addressNotFound(`${info.name} could not find "${address.input}"`, {
          suggestions: suggestions.slice(0, 5),
        });

      // Every street in the council comes back in one call, so cache it.
      const { streets } = await memoize(cache)(`waste-info:${subdomain}:streets`, DAY, () =>
        get(http, 'streets.json', StreetsResponse),
      );
      const candidates = findStreets(streets, parts);
      // Usually one street. Councils sometimes list the same street twice
      // ("Calarie Rd" and "Calarie Road"); anything else is ambiguous.
      const distinct = new Set(candidates.map((s) => `${expandStreetName(s.name)}|${s.locality}`));
      if (distinct.size !== 1) {
        // Keep the house number, so each suggestion can be looked up as it stands.
        const number = [parts.unit, parts.houseNumber].filter(Boolean).join('/');
        throw notFound([...distinct].map((s) => `${number} ${s.replace('|', ', ')}`.trim()));
      }

      const properties = (
        await Promise.all(
          candidates.map((s) => get(http, `properties.json?street=${s.id}`, PropertiesResponse)),
        )
      ).flatMap((r) => r.properties);
      const matches = properties.filter((p) => matchesHouseNumber(p.name, parts));
      // "5 Smith St" should be the house, not unit 1/5, unless a unit was asked for.
      const property = matches.find((p) => !!parts.unit === p.name.includes('/')) ?? matches[0];
      if (!property) throw notFound(properties.map((p) => p.name));

      const path = `properties/${property.id}.json?start=${today}&end=${addDays(today, HORIZON_DAYS)}`;
      const services = parseWasteInfoEvents(await get(http, path, EventsResponse), colours);
      if (!services.length) {
        throw parseError(`No bin services found for ${property.name}`, { url: `${api}/${path}` });
      }
      return {
        matchedAddress: property.name,
        propertyId: String(property.id),
        services,
        sourceUrl: `${api}/${path}`,
      } satisfies CouncilSchedule;
    },
  };
}

/**
 * Streets matching the address, in its suburb if any are. A wrong suburb is
 * forgiven by the caller only when what's left is a single street.
 */
function findStreets(
  streets: Street[],
  parts: { street?: string; streetType?: string; suburb?: string },
): Street[] {
  const want = (parts.street ?? '').toLowerCase();
  const named = streets.filter((s) => {
    const name = expandStreetName(s.name).toLowerCase();
    return name === want || (!parts.streetType && name.startsWith(`${want} `));
  });
  return preferSuburb(named, (s) => s.locality, parts.suburb);
}

/** Some councils list "Acacia Cir" or "Abbott St"; the parsed address always has the full type. */
function expandStreetName(name: string): string {
  const words = name.split(' ');
  const type = expandStreetType(words.at(-1) ?? '');
  return type ? [...words.slice(0, -1), type].join(' ') : name;
}

/** Turn the platform's calendar events into services. Exported for tests. */
export function parseWasteInfoEvents(
  events: z.infer<typeof EventsResponse>,
  colours: Partial<Record<BinType, string>> = {},
): BinService[] {
  const services = new Map<string, BinService>();
  for (const event of events) {
    const bin = BINS[event.event_type];
    const date = event.start_date ?? event.start;
    if (!bin || !date || !isLocalDate(date)) continue;
    // A weekly "clean_up" is the day booked collections run (Campbelltown), not a collection.
    if (bin.type === 'bulky' && event.start_date) continue;

    const existing = services.get(event.event_type)?.recurrence;
    if (existing?.kind === 'dates') {
      existing.dates = [...existing.dates, date];
      continue;
    }
    const colour = colours[bin.type] ?? bin.colour ?? DEFAULT_COLOURS[bin.type];
    services.set(event.event_type, {
      type: bin.type,
      name: bin.name,
      ...(colour ? { colour } : {}),
      recurrence: event.start_date
        ? { kind: 'interval', everyDays: 7, anchor: date }
        : { kind: 'dates', dates: [date] },
    });
  }
  return [...services.values()];
}
