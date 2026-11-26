import { readdirSync } from 'node:fs';
import { expect, it } from 'vitest';
import { ALL_COUNCILS } from '../../src/councils/index.js';

// If this fails, run `npm run build:registry`: a council file isn't in the generated list.
it('lists every council file, once', () => {
  const folder = new URL('../../src/councils/', import.meta.url);
  const files = readdirSync(folder, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((state) =>
      readdirSync(new URL(`${state.name}/`, folder)).map((file) => `${state.name}/${file}`),
    )
    .filter((file) => file.endsWith('.ts'));
  expect(ALL_COUNCILS).toHaveLength(files.length);
  expect(new Set(ALL_COUNCILS.map((council) => council.id)).size).toBe(files.length);
});
