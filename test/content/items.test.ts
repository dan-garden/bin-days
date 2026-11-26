import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ARTICLES } from '../../src/content/articles.js';
import { coverPath } from '../../src/content/covers.js';
import { ITEMS, itemPath, itemQuestion } from '../../src/content/items.js';
import { markdownToHtml } from '../../src/content/markdown.js';
import { ALL_COUNCILS } from '../../src/councils/index.js';
import { councilPath, statePath } from '../../src/councils/names.js';

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

describe('written pages', () => {
  const councilPaths = new Set([
    ...ALL_COUNCILS.map(councilPath),
    ...ALL_COUNCILS.map((council) => statePath(council.state)),
  ]);
  const exists = (path: string) =>
    path === '/' ||
    ARTICLES.has(path) ||
    councilPaths.has(path) ||
    ['/docs', '/openapi.json', '/llms.txt', '/data/bin-collections.csv'].includes(path) ||
    path.startsWith('/v1/');

  it('each have a share image (run `npm run build:covers` after adding one)', () => {
    for (const article of ARTICLES.values())
      expect(existsSync(`web/public${coverPath(article)}`), article.path).toBe(true);
  });

  it('have titles and descriptions that fit in search results', () => {
    for (const article of ARTICLES.values()) {
      expect(
        (article.seoTitle ?? `${article.title} | Bin Days`).length,
        article.path,
      ).toBeLessThanOrEqual(65);
      expect(article.description.length, article.path).toBeLessThanOrEqual(165);
    }
  });

  it('suggest only related pages that exist', () => {
    for (const article of ARTICLES.values())
      for (const path of article.related ?? [])
        expect(ARTICLES.has(path), `${article.path} → ${path}`).toBe(true);
  });

  it('link only to pages that exist', () => {
    for (const article of ARTICLES.values()) {
      const html = article.html ?? markdownToHtml(article.body ?? '');
      for (const [, path] of html.matchAll(/href="(\/[^"#?]*)/g))
        expect(exists(path as string), `${article.path} → ${path}`).toBe(true);
    }
  });
});
