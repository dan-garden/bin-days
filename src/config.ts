import { SqliteCache, UpstashCache } from './core/cache.js';
import { createHttpClient } from './core/http.js';
import { createNominatimGeocoder } from './geo/nominatim.js';
import { BinDaysService } from './service.js';

/** Build a service from environment variables (see `.env.example`). */
export function createServiceFromEnv(env: NodeJS.ProcessEnv = process.env): BinDaysService {
  const http = createHttpClient(
    env.BIN_DAYS_USER_AGENT ? { userAgent: env.BIN_DAYS_USER_AGENT } : {},
  );
  const geocoder = createNominatimGeocoder(
    http,
    env.NOMINATIM_URL ? { baseUrl: env.NOMINATIM_URL } : {},
  );
  // Upstash's own names, or the ones Vercel's storage integration sets.
  const redisUrl = env.UPSTASH_REDIS_REST_URL ?? env.KV_REST_API_URL;
  const redisToken = env.UPSTASH_REDIS_REST_TOKEN ?? env.KV_REST_API_TOKEN;
  const cache =
    redisUrl && redisToken
      ? new UpstashCache(redisUrl, redisToken, http)
      : env.BIN_DAYS_CACHE_PATH
        ? new SqliteCache(env.BIN_DAYS_CACHE_PATH)
        : undefined;
  return new BinDaysService({ http, geocoder, ...(cache ? { cache } : {}) });
}
