/**
 * Checks that every council's source still works: looks up each council's
 * sample addresses (from the live tests) through the real pipeline, one at a
 * time, and lists the councils that fail. Run it by hand, e.g. every Monday:
 *
 *   npm run check:sources                    every council (about 15 minutes)
 *   npm run check:sources -- qld/logan wa/   only councils whose id starts with these
 *
 * Exits with 1 if any council fails, so it can run on a schedule later.
 */
import { ALL_COUNCILS } from '../src/councils/index.js';
import { BinDaysService } from '../src/service.js';
import { ADDRESSES, problemWith } from '../test/live/addresses.js';

const only = process.argv.slice(2);
const councils = ALL_COUNCILS.filter(
  (council) => !only.length || only.some((prefix) => council.id.startsWith(prefix)),
);
const service = new BinDaysService();
const failed: Array<{ id: string; address: string; problem: string }> = [];

for (const [index, council] of councils.entries()) {
  const addresses = ADDRESSES[council.id] ?? [];
  const problems = addresses.length ? [] : [{ address: '-', problem: 'no sample address' }];
  for (const address of addresses) {
    const problem = await service.lookup({ address }).then(
      (result) => problemWith(result, council.id),
      (error: Error & { code?: string }) => `${error.code ?? 'ERROR'}: ${error.message}`,
    );
    if (problem) problems.push({ address, problem });
  }
  failed.push(...problems.map((p) => ({ id: council.id, ...p })));
  const status = problems.length ? 'FAIL' : 'ok  ';
  console.log(`${status} [${index + 1}/${councils.length}] ${council.id}`);
}

console.log(
  `\n${councils.length - new Set(failed.map((f) => f.id)).size} of ${councils.length} councils work.`,
);
if (failed.length) {
  console.log('\nFailed:');
  for (const { id, address, problem } of failed) console.log(`- ${id} (${address}): ${problem}`);
  process.exitCode = 1;
}
