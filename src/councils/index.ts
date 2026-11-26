import { ALL_COUNCILS } from './all.generated.js';
import { CouncilRegistry } from './registry.js';

/** Every supported council. The list is generated from the files under each state's folder. */
export { ALL_COUNCILS };

export function createDefaultRegistry(): CouncilRegistry {
  return new CouncilRegistry(ALL_COUNCILS);
}

export { CouncilRegistry } from './registry.js';
export type { AdapterContext, CouncilAdapter, CouncilInfo } from './types.js';
