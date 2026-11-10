import type { Cache } from '../core/cache.js';
import type { HttpClient } from '../core/http.js';
import type {
  AustralianState,
  CouncilSchedule,
  LocalDate,
  ResolvedAddress,
} from '../core/types.js';

/**
 * Everything an adapter may use. Adapters must not create their own HTTP
 * clients or caches. Using these means tests can inject fixtures and
 * deployments can swap the cache backend.
 */
export interface AdapterContext {
  http: HttpClient;
  cache: Cache;
  /** Today's date in the council's timezone. */
  today: LocalDate;
}

/** Static description of a council. Returned by `GET /v1/councils`. */
export interface CouncilInfo {
  /** Stable slug, `<state>/<name>`, e.g. `qld/gold-coast`. */
  id: string;
  name: string;
  state: AustralianState;
  /**
   * ABS Local Government Area codes this adapter covers (ASGS 2024 edition).
   * This is how an address is routed to a council. Look codes up at
   * https://geo.abs.gov.au/arcgis/rest/services/ASGS2024/LGA/MapServer/0
   */
  lgaCodes: string[];
  /** IANA timezone, e.g. `Australia/Brisbane`. */
  timezone: string;
  website?: string;
  /** Which reusable platform adapter powers this, e.g. `opencities`. */
  platform?: string;
}

/**
 * The single interface every council implements. Adding a new council is:
 * implement this (often a one-line config for a platform adapter) and add it
 * to `src/councils/index.ts`.
 */
export interface CouncilAdapter extends CouncilInfo {
  /**
   * Look up the bin services for an address. Throw `addressNotFound` if the
   * council doesn't recognise it, and `upstreamError` or `parseError` if the
   * council's site misbehaves.
   */
  getSchedule(address: ResolvedAddress, ctx: AdapterContext): Promise<CouncilSchedule>;
}
