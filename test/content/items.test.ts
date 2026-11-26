import { describe, expect, it } from 'vitest';
import { ARTICLES } from '../../src/content/articles.js';
import { ITEMS, itemPath, itemQuestion } from '../../src/content/items.js';

describe('which bin items', () => {
  it('each has a unique address, an answer and at least one source', () => {
    expect(new Set(ITEMS.map((item) => item.slug)).size).toBe(ITEMS.length);
    for (const item of ITEMS) {
      expect(item.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(item.answer.length).toBeGreaterThan(20);
      expect(item.sources.length).toBeGreaterThan(0);
      for (const source of item.sources) expect(source.url).toMatch(/^https:\/\//);
    }
  });

  it('asks the question the way people do', () => {
    const named = (name: string) => itemQuestion({ ...ITEMS[0]!, name });
    expect(named('Pizza boxes')).toBe('Which bin do pizza boxes go in?');
    expect(named('Glass')).toBe('Which bin does glass go in?');
    expect(named('Dog poo')).toBe('Which bin does dog poo go in?');
  });

  it('only links to pages that exist', () => {
    for (const item of ITEMS) {
      const html = ARTICLES.get(itemPath(item))?.html ?? '';
      for (const [, path] of html.matchAll(/href="(\/[^"#]*)"/g))
        expect(path === '/' || ARTICLES.has(path as string), `${item.slug} → ${path}`).toBe(true);
    }
  });
});
