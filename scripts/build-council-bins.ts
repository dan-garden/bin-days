/**
 * Writes `src/councils/bins.generated.ts`: the bins each council collects and
 * how often, for the council and suburb pages. It looks up each council's
 * sample address (from the live tests) through the real pipeline, one council
 * at a time. Run it with `npm run build:bins` after adding a council; it takes
 * several minutes. Name councils to look up only those (`npm run build:bins -- nsw/ wa/albany`);
 * the rest keep what the file already says.
 *
 * A council whose lookup fails keeps what the file already said about it.
 */
import { writeFileSync } from 'node:fs';
import { createServiceFromEnv } from '../src/config.js';
import { COUNCIL_BINS, type CouncilBin } from '../src/councils/bins.generated.js';
import { ALL_COUNCILS } from '../src/councils/index.js';
import { ADDRESSES } from '../test/live/addresses.js';

const service = createServiceFromEnv();
const bins: Record<string, CouncilBin[]> = {};
const failed: string[] = [];

const only = process.argv.slice(2);
for (const council of ALL_COUNCILS) {
  if (only.length && !only.some((prefix) => council.id.startsWith(prefix))) {
    const kept = COUNCIL_BINS[council.id];
    if (kept) bins[council.id] = kept;
    continue;
  }
  let found: CouncilBin[] | undefined;
  for (const address of ADDRESSES[council.id] ?? []) {
    try {
      // Geocoded like any visitor's lookup: councils matched by map point need the location.
      const result = await service.lookup({ address });
      if (result.council.id !== council.id) continue;
      found = result.services.map(({ type, name, colour, frequency, optional }) => ({
        type,
        name,
        ...(colour ? { colour } : {}),
        frequency,
        ...(optional ? { optional } : {}),
      }));
      break;
    } catch {}
  }
  const previous = COUNCIL_BINS[council.id];
  if (found) bins[council.id] = found;
  else {
    failed.push(council.id);
    if (previous) bins[council.id] = previous;
  }
}

writeFileSync(
  'src/councils/bins.generated.ts',
  `// Written by \`npm run build:bins\`. Do not edit.\nimport type { ServiceSummary } from '../service.js';\n\n/** A bin a council collects at its sample address, and how often. */\nexport type CouncilBin = Pick<ServiceSummary, 'type' | 'name' | 'colour' | 'frequency' | 'optional'>;\n\nexport const COUNCIL_BINS: Record<string, CouncilBin[]> = ${JSON.stringify(bins)};\n`,
);
console.log(
  `${Object.keys(bins).length} councils written. Lookups failed: ${failed.join(', ') || 'none'}`,
);
