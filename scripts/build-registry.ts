/**
 * Writes `src/councils/all.generated.ts`: every council file under
 * `src/councils/<state>/`, imported and listed. Run it with
 * `npm run build:registry` after adding or removing a council file.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { AUSTRALIAN_STATES } from '../src/core/types.js';

const councils = AUSTRALIAN_STATES.map((state) => state.toLowerCase())
  .filter((state) => existsSync(`src/councils/${state}`))
  .flatMap((state) =>
    readdirSync(`src/councils/${state}`, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith('.ts'))
      .map((entry) => {
        const source = readFileSync(`src/councils/${state}/${entry.name}`, 'utf8');
        const name = /export const (\w+)(?::\s*CouncilAdapter)?\s*=/.exec(source)?.[1];
        if (!name) throw new Error(`src/councils/${state}/${entry.name} exports no council`);
        return { name, path: `./${state}/${entry.name.replace(/\.ts$/, '.js')}` };
      }),
  )
  .sort((a, b) => a.path.localeCompare(b.path));

writeFileSync(
  'src/councils/all.generated.ts',
  `// Written by \`npm run build:registry\`. Do not edit.
${councils.map(({ name, path }) => `import { ${name} } from '${path}';`).join('\n')}
import type { CouncilAdapter } from './types.js';

export const ALL_COUNCILS: readonly CouncilAdapter[] = [
${councils.map(({ name }) => `  ${name},`).join('\n')}
];
`,
);
console.log(`${councils.length} councils listed`);
