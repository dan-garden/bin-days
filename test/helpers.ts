import { readFileSync } from 'node:fs';
import { parseAustralianAddress } from '../src/core/address.js';
import { NoopCache } from '../src/core/cache.js';
import { toLocalDate } from '../src/core/date.js';
import type { HttpClient } from '../src/core/http.js';
import type { BinService, ResolvedAddress } from '../src/core/types.js';
import type { AdapterContext } from '../src/councils/types.js';

export const d = toLocalDate;

export function fixture(name: string): string {
  return readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8');
}

type Route = (url: URL, init?: RequestInit) => Response | Promise<Response> | undefined;

/** An HttpClient that answers from a list of routes and records every call. */
export function fakeHttp(...routes: Route[]): HttpClient & { calls: URL[] } {
  const calls: URL[] = [];
  return {
    calls,
    async fetch(input, init) {
      const url = new URL(String(input));
      calls.push(url);
      for (const route of routes) {
        const res = await route(url, init);
        if (res) return res;
      }
      return new Response('not found', { status: 404 });
    },
  };
}

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export function ctx(http: HttpClient, today = '2026-11-10'): AdapterContext {
  return { http, cache: new NoopCache(), today: d(today) };
}

/** An address as the service hands it to an adapter, optionally located on the map. */
export function resolved(input: string, latitude?: number, longitude?: number): ResolvedAddress {
  return {
    input,
    parts: parseAustralianAddress(input),
    ...(latitude != null && longitude != null ? { latitude, longitude } : {}),
  };
}

/** Each bin's type and when it goes, for comparing a schedule in one go. */
export const recurrences = (schedule: { services: BinService[] }) =>
  schedule.services.map((service) => [service.type, service.recurrence]);

export const text = (body: string) => new Response(body);
