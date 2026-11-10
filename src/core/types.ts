/**
 * Core domain model. Every council adapter produces these shapes, and every
 * API response is built from them, so adding a council never changes the
 * response contract.
 */

/** A calendar date with no time or timezone, formatted `YYYY-MM-DD`. */
export type LocalDate = string & { readonly __brand: 'LocalDate' };

export const AUSTRALIAN_STATES = ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA'] as const;
export type AustralianState = (typeof AUSTRALIAN_STATES)[number];

/**
 * Normalised bin categories. Councils use different names and colours ("red
 * bin", "general waste", "rubbish", "garbage"), but they all map onto one of
 * these. `name` on a service keeps the council's own label.
 */
export const BIN_TYPES = [
  'general', // landfill / rubbish / garbage (usually red or dark green lid)
  'recycling', // mixed recycling (usually yellow lid)
  'organics', // garden organics, or food + garden (FOGO) (usually lime green lid)
  'food', // separate food-only caddy/bin
  'glass', // separate glass bin (usually purple lid)
  'bulky', // kerbside large item / hard rubbish
  'other',
] as const;
export type BinType = (typeof BIN_TYPES)[number];

/**
 * How a service repeats.
 * - `interval`: every N days from an anchor date (weekly = 7, fortnightly = 14).
 * - `dates`: an explicit list of dates, e.g. from a published calendar.
 */
export type Recurrence =
  | { kind: 'interval'; everyDays: number; anchor: LocalDate }
  | { kind: 'dates'; dates: readonly LocalDate[] };

/** One bin service at one property, as reported by a council. */
export interface BinService {
  type: BinType;
  /** The council's own label, e.g. "Green organics". */
  name: string;
  /** Lid colour, if known. */
  colour?: string;
  recurrence: Recurrence;
  /** e.g. green bins that are an opt-in subscription. */
  optional?: boolean;
  notes?: string;
}

/** What a council adapter returns for an address. */
export interface CouncilSchedule {
  /** The address as the council knows it. */
  matchedAddress: string;
  /** Council-specific property identifier, if any. */
  propertyId?: string;
  services: BinService[];
  /** Where the data came from (for debugging / attribution). */
  sourceUrl?: string;
}

/** An address after geocoding and boundary lookup. */
export interface ResolvedAddress {
  input: string;
  /** Parsed components of the input (see `parseAustralianAddress`). */
  parts: AddressParts;
  latitude?: number;
  longitude?: number;
  /** ABS Local Government Area. */
  lga?: { code: string; name: string };
  state?: AustralianState;
  /** Human-readable address from the geocoder. */
  formatted?: string;
}

export interface AddressParts {
  unit?: string;
  houseNumber?: string;
  street?: string;
  /** Street type in full, e.g. "Road" (if recognised). */
  streetType?: string;
  /** Street name without the type, e.g. "Example". */
  streetName?: string;
  suburb?: string;
  state?: AustralianState;
  postcode?: string;
}

export type Confidence = 'confirmed' | 'projected';

/** A single bin going out on a single day. */
export interface CollectionEvent {
  date: LocalDate;
  type: BinType;
  name: string;
  colour?: string;
  /**
   * `confirmed`: the council stated this exact date.
   * `projected`: calculated from the recurrence. Public holidays can shift it.
   */
  confidence: Confidence;
}
