import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import type { DatabaseSync } from 'node:sqlite';
import { getJson, type HttpClient } from './http.js';

/**
 * Minimal async cache interface. The default is in-memory and `SqliteCache`
 * persists to a file
 * and `UpstashCache` to hosted Redis; add others by implementing `Cache`.
 */
export interface Cache {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T, ttlMs: number): Promise<void>;
}

/** In-memory cache with TTL and least-recently-used eviction. */
export class MemoryCache implements Cache {
  readonly #entries = new Map<string, { value: unknown; expiresAt: number }>();

  constructor(
    private readonly maxEntries = 5_000,
    private readonly now: () => number = Date.now,
  ) {}

  async get<T>(key: string): Promise<T | undefined> {
    const entry = this.#entries.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= this.now()) {
      this.#entries.delete(key);
      return undefined;
    }
    // Re-insert to mark as most recently used.
    this.#entries.delete(key);
    this.#entries.set(key, entry);
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    this.#entries.delete(key);
    this.#entries.set(key, { value, expiresAt: this.now() + ttlMs });
    while (this.#entries.size > this.maxEntries) {
      const oldest = this.#entries.keys().next().value;
      if (oldest === undefined) break;
      this.#entries.delete(oldest);
    }
  }

  get size(): number {
    return this.#entries.size;
  }
}

/**
 * A cache in a SQLite file, so geocodes and schedules survive restarts. Uses
 * Node's built-in `node:sqlite`, loaded only when this class is constructed.
 */
export class SqliteCache implements Cache {
  readonly #db: DatabaseSync;

  constructor(
    path: string,
    private readonly now: () => number = Date.now,
  ) {
    const { DatabaseSync } = process.getBuiltinModule('node:sqlite');
    if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
    this.#db = new DatabaseSync(path);
    this.#db.exec(
      `PRAGMA journal_mode = WAL;
       CREATE TABLE IF NOT EXISTS cache (
         key TEXT PRIMARY KEY, value TEXT NOT NULL, expires_at INTEGER NOT NULL
       ) STRICT`,
    );
    // shortcut: expired rows are only pruned at startup; add a periodic sweep if the file grows.
    this.#db.prepare('DELETE FROM cache WHERE expires_at <= ?').run(this.now());
  }

  async get<T>(key: string): Promise<T | undefined> {
    const row = this.#db
      .prepare('SELECT value FROM cache WHERE key = ? AND expires_at > ?')
      .get(key, this.now());
    return row ? (JSON.parse(row.value as string) as T) : undefined;
  }

  async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    if (value === undefined) return;
    this.#db
      .prepare('INSERT OR REPLACE INTO cache (key, value, expires_at) VALUES (?, ?, ?)')
      .run(key, JSON.stringify(value), this.now() + ttlMs);
  }
}

/**
 * A cache in Upstash Redis over its REST API, for hosts with no disk and no
 * long-lived process (Vercel and other serverless platforms). A Redis outage
 * degrades to cache misses rather than failing lookups.
 */
export class UpstashCache implements Cache {
  constructor(
    private readonly url: string,
    private readonly token: string,
    private readonly http: HttpClient,
  ) {}

  async #command<T>(...command: Array<string | number>): Promise<T | undefined> {
    try {
      const { result } = await getJson<{ result: T }>(this.http, this.url, {
        method: 'POST',
        headers: { authorization: `Bearer ${this.token}` },
        body: JSON.stringify(command),
      });
      return result;
    } catch (error) {
      console.warn('bin-days: cache unavailable:', error instanceof Error ? error.message : error);
      return undefined;
    }
  }

  async get<T>(key: string): Promise<T | undefined> {
    const value = await this.#command<string | null>('GET', `bin-days:${key}`);
    return value == null ? undefined : (JSON.parse(value) as T);
  }

  async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    if (value === undefined) return;
    await this.#command('SET', `bin-days:${key}`, JSON.stringify(value), 'PX', ttlMs);
  }
}

/** A cache that stores nothing. Useful in tests. */
export class NoopCache implements Cache {
  async get<T>(): Promise<T | undefined> {
    return undefined;
  }
  async set(): Promise<void> {}
}

/**
 * Return the cached value for `key`, or compute, store and return it.
 * Concurrent callers for the same key share one in-flight computation.
 */
export function memoize(cache: Cache) {
  const inflight = new Map<string, Promise<unknown>>();
  return async function cached<T>(key: string, ttlMs: number, compute: () => Promise<T>) {
    const hit = await cache.get<T>(key);
    if (hit !== undefined) return hit;
    const pending = inflight.get(key) as Promise<T> | undefined;
    if (pending) return pending;
    const promise = compute()
      .then(async (value) => {
        await cache.set(key, value, ttlMs);
        return value;
      })
      .finally(() => inflight.delete(key));
    inflight.set(key, promise);
    return promise;
  };
}
