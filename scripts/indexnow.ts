/**
 * Tells search engines that use IndexNow (Bing, Yandex, Seznam and others) about every page in the
 * live sitemap, so new and changed pages are crawled soon after a deploy rather than whenever.
 * Run it after a deploy has gone live: `npm run indexnow` (or `npm run indexnow -- https://other.site`).
 */
import { INDEXNOW_KEY } from '../src/api/site.js';

const site = (process.argv[2] ?? 'https://bindays.au').replace(/\/$/, '');
const sitemap = await fetch(`${site}/sitemap.xml`).then((response) => response.text());
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1] as string);
// One request takes up to 10,000 addresses.
for (let start = 0; start < urls.length; start += 10_000) {
  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: new URL(site).host,
      key: INDEXNOW_KEY,
      keyLocation: `${site}/${INDEXNOW_KEY}.txt`,
      urlList: urls.slice(start, start + 10_000),
    }),
  });
  console.log(
    `${response.status} ${response.statusText}: ${Math.min(10_000, urls.length - start)} pages`,
  );
}
