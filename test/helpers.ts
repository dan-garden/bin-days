import { readFileSync } from 'node:fs';
import { NoopCache } from '../src/core/cache.js';
import { toLocalDate } from '../src/core/date.js';
import type { HttpClient } from '../src/core/http.js';
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
