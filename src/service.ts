import { formatStreetLine, parseAustralianAddress } from './core/address.js';
import { type Cache, MemoryCache, memoize } from './core/cache.js';
import { addDays, compareDates, daysBetween, today, type Weekday, weekday } from './core/date.js';
import { addressNotFound, councilNotSupported, invalidInput } from './core/errors.js';
import { createHttpClient, type HttpClient } from './core/http.js';
import { collectionsInRange, intervalDays, nextCollection } from './core/schedule.js';
import type {
  AddressParts,
  AustralianState,
  BinService,
  BinType,
  CollectionEvent,
  Confidence,
  CouncilSchedule,
  LocalDate,
  ResolvedAddress,
} from './core/types.js';
import { createDefaultRegistry } from './councils/index.js';
import type { CouncilRegistry } from './councils/registry.js';
import type { CouncilAdapter, CouncilInfo } from './councils/types.js';
import { createAbsLgaResolver } from './geo/abs-lga.js';
import { createNominatimGeocoder } from './geo/nominatim.js';
import type {
  GeocodeHints,
  GeocodeResult,
  Geocoder,
  LgaBoundary,
  LgaResolver,
} from './geo/types.js';

export interface LookupRequest {
  address: string;
  /** A single day. Shorthand for `from = to = date`. */
  date?: LocalDate;
  /** Start of range (inclusive). Defaults to today in the council's timezone. */
  from?: LocalDate;
  /** End of range (inclusive). Defaults to `from + 13` days (two weeks). */
  to?: LocalDate;
  /** Skip geocoding and use this council id directly, e.g. `qld/gold-coast`. */
  council?: string;
}

export interface ServiceSummary {
  type: BinType;
  name: string;
  colour?: string;
  frequency: 'weekly' | 'fortnightly' | 'irregular' | `every ${number} days`;
  everyDays?: number;
  /** Next collection on or after today. */
  next?: LocalDate;
  optional?: boolean;
  notes?: string;
}

export interface CollectionDay {
  date: LocalDate;
  weekday: Weekday;
  bins: Array<{ type: BinType; name: string; colour?: string; confidence: Confidence }>;
}

/** The stable response contract, the same for every council. */
export interface BinDaysResult {
  address: {
    input: string;
    matched: string;
    /** What the geocoder resolved the input to, useful for spotting a wrong match. */
    geocoded?: string;
    parts: AddressParts;
    latitude?: number;
    longitude?: number;
    lga?: { code: string; name: string };
  };
  council: CouncilInfo;
  timezone: string;
  today: LocalDate;
  range: { from: LocalDate; to: LocalDate };
  services: ServiceSummary[];
  /** Only days with at least one collection, in date order. */
  days: CollectionDay[];
  /** The next collection day on or after today (which may be outside `range`). */
  next: CollectionDay | null;
  source?: string;
}

/** Where the supported councils are, as a GeoJSON `FeatureCollection`. */
export interface Coverage {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    properties: { council: string; name: string; state: AustralianState };
    geometry: LgaBoundary['geometry'];
  }>;
}

export interface BinDaysServiceOptions {
  registry?: CouncilRegistry;
  http?: HttpClient;
  cache?: Cache;
  geocoder?: Geocoder;
  lgaResolver?: LgaResolver;
  /** Max days per request. Default 366. */
  maxRangeDays?: number;
  now?: () => Date;
}

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const TTL = {
  geocode: 30 * DAY,
  lga: 90 * DAY,
  schedule: 6 * HOUR,
};

export class BinDaysService {
  readonly registry: CouncilRegistry;
  readonly #http: HttpClient;
  readonly #cache: Cache;
  readonly #cached: ReturnType<typeof memoize>;
  readonly #geocoder: Geocoder;
  readonly #lga: LgaResolver;
  readonly #maxRangeDays: number;
  readonly #now: () => Date;

  constructor(options: BinDaysServiceOptions = {}) {
    this.registry = options.registry ?? createDefaultRegistry();
    this.#http = options.http ?? createHttpClient();
    this.#cache = options.cache ?? new MemoryCache();
    this.#cached = memoize(this.#cache);
    this.#geocoder = options.geocoder ?? createNominatimGeocoder(this.#http);
    this.#lga = options.lgaResolver ?? createAbsLgaResolver(this.#http);
    this.#maxRangeDays = options.maxRangeDays ?? 366;
    this.#now = options.now ?? (() => new Date());
  }

  /** Address in, consistently-shaped bin schedule out. */
  async lookup(request: LookupRequest): Promise<BinDaysResult> {
    const { adapter, address } = await this.resolve(request.address, request.council);

    const todayLocal = today(adapter.timezone, this.#now());
    const from = request.date ?? request.from ?? todayLocal;
    const to = request.date ?? request.to ?? addDays(from, 13);
    if (compareDates(from, to) > 0) throw invalidInput('`from` must be on or before `to`');
    if (daysBetween(from, to) + 1 > this.#maxRangeDays) {
      throw invalidInput(`Date range is limited to ${this.#maxRangeDays} days`);
    }

    const schedule = await this.getSchedule(adapter, address, todayLocal);
    const events = collectionsInRange(schedule.services, from, to);
    const { getSchedule: _, ...council } = adapter;

    return {
      address: {
        input: address.input,
        matched: schedule.matchedAddress,
        ...(address.formatted ? { geocoded: address.formatted } : {}),
        parts: address.parts,
        ...(address.latitude != null ? { latitude: address.latitude } : {}),
        ...(address.longitude != null ? { longitude: address.longitude } : {}),
        ...(address.lga ? { lga: address.lga } : {}),
      },
      council,
      timezone: adapter.timezone,
      today: todayLocal,
      range: { from, to },
      services: schedule.services.map((s) => summarise(s, todayLocal)),
      days: groupByDay(events),
      next: nextDay(schedule.services, todayLocal),
      ...(schedule.sourceUrl ? { source: schedule.sourceUrl } : {}),
    };
  }

  /** The area each supported council covers, for drawing a map. */
  async coverage(): Promise<Coverage> {
    const codes = this.registry.list().flatMap((c) => c.lgaCodes);
    const boundaries = await this.#cached(`coverage:${codes.join(',')}`, TTL.lga, () =>
      this.#lga.boundaries(codes),
    );
    return {
      type: 'FeatureCollection',
      features: boundaries.flatMap((b) => {
        const council = this.registry.findByLga(b.code);
        if (!council) return [];
        const { id, name, state } = council;
        return [
          { type: 'Feature', properties: { council: id, name, state }, geometry: b.geometry },
        ];
      }),
    };
  }

  /** Parse, geocode and route an address to a council adapter. */
  async resolve(
    input: string,
    councilId?: string,
  ): Promise<{ adapter: CouncilAdapter; address: ResolvedAddress }> {
    const text = input?.trim();
    if (!text) throw invalidInput('Please provide an address');
    if (text.length > 300) throw invalidInput('Address is too long');

    const parts = parseAustralianAddress(text);
    if (!parts.street)
      throw invalidInput('Could not find a street name in that address', { parts });
    const address: ResolvedAddress = { input: text, parts };

    if (councilId) {
      const adapter = this.registry.get(councilId);
      if (!adapter) throw councilNotSupported(`Unknown council "${councilId}"`);
      return { adapter, address };
    }

    const geo = await this.#geocode(parts, text);
    if (!geo) throw addressNotFound(`Could not locate "${text}"`);
    address.latitude = geo.latitude;
    address.longitude = geo.longitude;
    address.formatted = geo.formatted;
    // Fill in anything the user left out (often the suburb or state).
    if (!parts.suburb && geo.suburb) parts.suburb = geo.suburb;
    if (!parts.postcode && geo.postcode) parts.postcode = geo.postcode;
    if (!parts.state && geo.state) parts.state = geo.state;
    if (parts.state) address.state = parts.state;

    const key = `lga:${geo.latitude.toFixed(5)},${geo.longitude.toFixed(5)}`;
    const lga = await this.#cached(key, TTL.lga, () =>
      this.#lga.lookup(geo.latitude, geo.longitude).then((r) => r ?? null),
    );
    if (!lga)
      throw addressNotFound(`"${text}" does not appear to be within an Australian council area`);
    address.lga = { code: lga.code, name: lga.name };

    const adapter = this.registry.findByLga(lga.code);
    if (!adapter) {
      throw councilNotSupported(`${lga.name} (${lga.state ?? 'AU'}) is not supported yet`, {
        lga,
        supported: this.registry.list().map((c) => c.id),
      });
    }
    return { adapter, address };
  }

  async getSchedule(
    adapter: CouncilAdapter,
    address: ResolvedAddress,
    todayLocal: LocalDate,
  ): Promise<CouncilSchedule> {
    const p = address.parts;
    const key = `schedule:${adapter.id}:${[p.unit, p.houseNumber, p.street, p.suburb]
      .join('|')
      .toLowerCase()}`;
    return this.#cached(key, TTL.schedule, () =>
      adapter.getSchedule(address, { http: this.#http, cache: this.#cache, today: todayLocal }),
    );
  }

  async #geocode(parts: AddressParts, raw: string): Promise<GeocodeResult | undefined> {
    const locality = [parts.suburb, parts.state, parts.postcode].filter(Boolean).join(' ');
    const queries = [
      // Geocoders handle "2/35 Peel St" poorly, so drop the unit.
      [formatStreetLine(parts), locality].filter(Boolean).join(', '),
      raw,
      [parts.street, locality].filter(Boolean).join(', '),
      // The street isn't in that suburb as far as OSM knows (people often name
      // the next suburb over). The suburb alone still finds the right council.
      parts.suburb ? locality : '',
    ].filter(Boolean);
    for (const q of new Set(queries)) {
      const result = await this.#cached(`geo:${q.toLowerCase()}`, TTL.geocode, () =>
        this.#geocoder.geocode(`${q}, Australia`, hintsFrom(parts)).then((r) => r ?? null),
      );
      if (result) return result;
    }
    return undefined;
  }
}

function hintsFrom(parts: AddressParts): GeocodeHints {
  const hints: GeocodeHints = {};
  if (parts.houseNumber) hints.houseNumber = parts.houseNumber;
  if (parts.suburb) hints.suburb = parts.suburb;
  if (parts.postcode) hints.postcode = parts.postcode;
  if (parts.state) hints.state = parts.state;
  return hints;
}

function summarise(service: BinService, from: LocalDate): ServiceSummary {
  const everyDays = intervalDays(service.recurrence);
  const next = nextCollection(service, from);
  return {
    type: service.type,
    name: service.name,
    ...(service.colour ? { colour: service.colour } : {}),
    frequency:
      everyDays === 7
        ? 'weekly'
        : everyDays === 14
          ? 'fortnightly'
          : everyDays
            ? `every ${everyDays} days`
            : 'irregular',
    ...(everyDays ? { everyDays } : {}),
    ...(next ? { next } : {}),
    ...(service.optional ? { optional: true } : {}),
    ...(service.notes ? { notes: service.notes } : {}),
  };
}

function groupByDay(events: CollectionEvent[]): CollectionDay[] {
  const days = new Map<LocalDate, CollectionDay>();
  for (const { date, ...bin } of events) {
    let day = days.get(date);
    if (!day) {
      day = { date, weekday: weekday(date), bins: [] };
      days.set(date, day);
    }
    day.bins.push(bin);
  }
  return [...days.values()];
}

function nextDay(services: BinService[], from: LocalDate): CollectionDay | null {
  const dates = services.map((s) => nextCollection(s, from)).filter((d) => d !== undefined);
  if (!dates.length) return null;
  const first = dates.sort(compareDates)[0]!;
  return groupByDay(collectionsInRange(services, first, first))[0] ?? null;
}
