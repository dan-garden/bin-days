import { upstreamError } from './errors.js';

/**
 * Small fetch wrapper used by every adapter: timeouts, an identifying
 * User-Agent, JSON/text helpers and consistent upstream errors. Injectable,
 * so tests can replace the network with fixtures.
 */
export interface HttpClient {
  fetch(url: string | URL, init?: RequestInit): Promise<Response>;
}

export interface HttpOptions {
  userAgent?: string;
  timeoutMs?: number;
  fetch?: typeof globalThis.fetch;
}

export const DEFAULT_USER_AGENT = 'bin-days/2.0 (+https://github.com/dan-garden/bin-days)';

export function createHttpClient(options: HttpOptions = {}): HttpClient {
  const userAgent = options.userAgent || DEFAULT_USER_AGENT;
  const timeoutMs = options.timeoutMs ?? 15_000;
  const doFetch = options.fetch ?? globalThis.fetch;

  return {
    async fetch(url, init = {}) {
      const headers = new Headers(init.headers);
      if (!headers.has('user-agent')) headers.set('user-agent', userAgent);
      if (!headers.has('accept-language')) headers.set('accept-language', 'en-AU,en;q=0.9');
      const signal = init.signal
        ? AbortSignal.any([init.signal, AbortSignal.timeout(timeoutMs)])
        : AbortSignal.timeout(timeoutMs);
      try {
        return await doFetch(url, { ...init, headers, signal });
      } catch (error) {
        throw upstreamError(`Request to ${new URL(url).host} failed`, { url: String(url) }, error);
      }
    },
  };
}

async function ensureOk(response: Response, url: string | URL): Promise<Response> {
  if (!response.ok) {
    throw upstreamError(`${new URL(url).host} responded with HTTP ${response.status}`, {
      url: String(url),
      status: response.status,
    });
  }
  return response;
}

export async function getJson<T = unknown>(
  http: HttpClient,
  url: string | URL,
  init?: RequestInit,
): Promise<T> {
  const response = await ensureOk(await http.fetch(url, init), url);
  try {
    return (await response.json()) as T;
  } catch (error) {
    throw upstreamError(`${new URL(url).host} returned invalid JSON`, { url: String(url) }, error);
  }
}

export async function getText(
  http: HttpClient,
  url: string | URL,
  init?: RequestInit,
): Promise<string> {
  const response = await ensureOk(await http.fetch(url, init), url);
  return response.text();
}

/** Serialise calls so at most one starts every `intervalMs` (e.g. Nominatim's 1 req/s). */
export function rateLimit(intervalMs: number) {
  let next = 0;
  let chain: Promise<void> = Promise.resolve();
  return function schedule<T>(task: () => Promise<T>): Promise<T> {
    const run = chain.then(async () => {
      const wait = next - Date.now();
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      next = Date.now() + intervalMs;
    });
    chain = run.catch(() => {});
    return run.then(task);
  };
}
