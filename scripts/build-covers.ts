/**
 * Renders every written page's share image (src/content/covers.ts) to web/public/covers/*.png, by
 * photographing each one with headless Chrome. Run after adding or renaming a guide, item or page:
 * `npm run build:covers`. Needs Google Chrome or Chromium installed; set CHROME to its path if it
 * isn't `google-chrome`. Only pages whose image is missing are drawn, unless you pass `--all`.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ARTICLES } from '../src/content/articles.js';
import { coverHtml, coverPath } from '../src/content/covers.js';

const chrome = process.env.CHROME ?? 'google-chrome';
const all = process.argv.includes('--all');
const font = pathToFileURL(
  resolve('node_modules/@fontsource-variable/overpass/files/overpass-latin-wght-normal.woff2'),
).href;
const scratch = mkdtempSync(join(tmpdir(), 'bin-days-covers-'));
mkdirSync('web/public/covers', { recursive: true });

let drawn = 0;
try {
  for (const article of ARTICLES.values()) {
    const out = resolve('web/public', coverPath(article).slice(1));
    if (!all && existsSync(out)) continue;
    const page = join(scratch, 'cover.html');
    writeFileSync(page, coverHtml(article, font));
    const result = spawnSync(
      chrome,
      [
        '--headless=new',
        '--disable-gpu',
        '--hide-scrollbars',
        '--force-device-scale-factor=1',
        '--window-size=1200,630',
        `--screenshot=${out}`,
        pathToFileURL(page).href,
      ],
      { stdio: 'pipe', timeout: 30_000 },
    );
    if (result.status !== 0 || !existsSync(out)) {
      console.error(`Couldn't draw ${article.path}: ${result.stderr?.toString() || result.error}`);
      process.exitCode = 1;
      break;
    }
    drawn++;
  }
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
console.log(`Drew ${drawn} share image${drawn === 1 ? '' : 's'}.`);
