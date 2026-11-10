import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SqliteCache, UpstashCache } from '../../src/core/cache.js';
import { fakeHttp, json } from '../helpers.js';

describe('SqliteCache', () => {
  it('persists across instances, expires entries and keeps cached nulls', async () => {
    const path = join(mkdtempSync(join(tmpdir(), 'bin-days-')), 'nested', 'cache.db');
    let now = 1_000;
    const first = new SqliteCache(path, () => now);
    await first.set('a', { suburb: 'Kenmore' }, 500);
    await first.set('none', null, 500); // "the geocoder found nothing" is a cached answer
    await first.set('a', { suburb: 'Bulimba' }, 500);

    const second = new SqliteCache(path, () => now);
    expect(await second.get('a')).toEqual({ suburb: 'Bulimba' });
    expect(await second.get('none')).toBeNull();
    expect(await second.get('missing')).toBeUndefined();

    now = 1_500;
    expect(await second.get('a')).toBeUndefined();
  });
});

describe('UpstashCache', () => {
  it('speaks the Upstash REST protocol and round-trips JSON', async () => {
    const store = new Map<string, string>();
    const commands: unknown[][] = [];
    const http = fakeHttp(async (url, init) => {
      expect(String(url)).toBe('https://redis.example/');
      expect(new Headers(init?.headers).get('authorization')).toBe('Bearer secret');
      const [name, key, value, ...rest] = JSON.parse(String(init?.body));
      commands.push([name, key, ...rest]);
      if (name === 'SET') store.set(key, value);
      return json({ result: name === 'GET' ? (store.get(key) ?? null) : 'OK' });
    });
    const cache = new UpstashCache('https://redis.example', 'secret', http);

    expect(await cache.get('a')).toBeUndefined();
    await cache.set('a', { suburb: 'Kenmore' }, 500);
    await cache.set('none', null, 500);
    expect(await cache.get('a')).toEqual({ suburb: 'Kenmore' });
    expect(await cache.get('none')).toBeNull();
    expect(commands[1]).toEqual(['SET', 'bin-days:a', 'PX', 500]);
  });

  it('treats a Redis outage as a miss', async () => {
    const cache = new UpstashCache('https://redis.example', 'secret', fakeHttp());
    await cache.set('a', 1, 500);
    expect(await cache.get('a')).toBeUndefined();
  });
});
