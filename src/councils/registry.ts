import type { AustralianState } from '../core/types.js';
import type { CouncilAdapter, CouncilInfo } from './types.js';

export class CouncilRegistry {
  readonly #byId = new Map<string, CouncilAdapter>();
  readonly #byLga = new Map<string, CouncilAdapter>();

  constructor(adapters: Iterable<CouncilAdapter> = []) {
    for (const adapter of adapters) this.register(adapter);
  }

  register(adapter: CouncilAdapter): this {
    if (this.#byId.has(adapter.id)) throw new Error(`Duplicate council id "${adapter.id}"`);
    for (const code of adapter.lgaCodes) {
      const existing = this.#byLga.get(code);
      if (existing) {
        throw new Error(`LGA ${code} is claimed by both "${existing.id}" and "${adapter.id}"`);
      }
    }
    this.#byId.set(adapter.id, adapter);
    for (const code of adapter.lgaCodes) this.#byLga.set(code, adapter);
    return this;
  }

  get(id: string): CouncilAdapter | undefined {
    return this.#byId.get(id);
  }

  findByLga(code: string): CouncilAdapter | undefined {
    return this.#byLga.get(code);
  }

  list(filter: { state?: AustralianState } = {}): CouncilInfo[] {
    return [...this.#byId.values()]
      .filter((c) => !filter.state || c.state === filter.state)
      .map(({ getSchedule: _, ...info }) => info)
      .sort((a, b) => a.id.localeCompare(b.id));
  }
}
