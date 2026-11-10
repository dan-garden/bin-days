#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { createServiceFromEnv } from './config.js';
import { isLocalDate } from './core/date.js';
import { BinDaysError } from './core/errors.js';
import type { LocalDate } from './core/types.js';

const USAGE = `Usage: bin-days <address> [--date YYYY-MM-DD | --from YYYY-MM-DD --to YYYY-MM-DD] [--council id] [--json]

Examples:
  bin-days "833 Southport Nerang Road, Nerang QLD"
  bin-days "35 Peel St South Brisbane" --from 2026-12-01 --to 2026-12-31
  bin-days --list`;

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    date: { type: 'string' },
    from: { type: 'string' },
    to: { type: 'string' },
    council: { type: 'string' },
    json: { type: 'boolean', default: false },
    list: { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h', default: false },
  },
});

const service = createServiceFromEnv();

if (values.list) {
  for (const c of service.registry.list()) console.log(`${c.id.padEnd(24)} ${c.name}`);
  process.exit(0);
}

const address = positionals.join(' ');
if (values.help || !address) {
  console.log(USAGE);
  process.exit(values.help ? 0 : 1);
}

for (const key of ['date', 'from', 'to'] as const) {
  const v = values[key];
  if (v && !isLocalDate(v)) {
    console.error(`--${key} must be YYYY-MM-DD`);
    process.exit(1);
  }
}
const asDate = (v: string | undefined) => v as LocalDate | undefined;

try {
  const result = await service.lookup({
    address,
    ...(values.date ? { date: asDate(values.date)! } : {}),
    ...(values.from ? { from: asDate(values.from)! } : {}),
    ...(values.to ? { to: asDate(values.to)! } : {}),
    ...(values.council ? { council: values.council } : {}),
  });

  if (values.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`${result.address.matched}  (${result.council.name})`);
    console.log(`${result.range.from} → ${result.range.to}\n`);
    if (!result.days.length) console.log('No collections in this range.');
    for (const day of result.days) {
      const bins = day.bins
        .map((b) => `${b.name}${b.confidence === 'projected' ? '*' : ''}`)
        .join(', ');
      console.log(`${day.date}  ${day.weekday.padEnd(9)}  ${bins}`);
    }
    if (result.days.some((d) => d.bins.some((b) => b.confidence === 'projected'))) {
      console.log('\n* projected from the regular cycle. Public holidays may shift these.');
    }
  }
} catch (error) {
  if (error instanceof BinDaysError) {
    console.error(`${error.code}: ${error.message}`);
    if (error.details) console.error(JSON.stringify(error.details, null, 2));
    process.exit(2);
  }
  throw error;
}
