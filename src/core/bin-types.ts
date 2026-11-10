import type { BinType } from './types.js';

/**
 * Classify a council's bin label ("Green organics", "Red lid bin",
 * "FOGO", "Rubbish") into a normalised `BinType`. Adapters can pass
 * overrides for council-specific wording.
 */
const RULES: Array<[RegExp, BinType]> = [
  [/\bglass\b|purple/i, 'glass'],
  [/\bfogo\b|garden|vegetation|green[\s-]*(waste|organic|bin|lid)|organic|yard|lime/i, 'organics'],
  [/\bfood\b|caddy/i, 'food'],
  [/recycl|co-?mingled|yellow/i, 'recycling'],
  [/bulk|large\s*item|hard\s*(waste|rubbish)|kerbside\s*collection|clean-?\s?up/i, 'bulky'],
  [/general|rubbish|garbage|landfill|domestic\s*waste|household\s*waste|red|^waste$/i, 'general'],
];

export function classifyBin(label: string, overrides: Record<string, BinType> = {}): BinType {
  const key = label.trim().toLowerCase();
  for (const [k, v] of Object.entries(overrides)) if (k.toLowerCase() === key) return v;
  for (const [pattern, type] of RULES) if (pattern.test(label)) return type;
  return 'other';
}

/** Typical Australian lid colours, used when a council doesn't specify one. */
export const DEFAULT_COLOURS: Partial<Record<BinType, string>> = {
  general: 'red',
  recycling: 'yellow',
  organics: 'lime',
  glass: 'purple',
};
