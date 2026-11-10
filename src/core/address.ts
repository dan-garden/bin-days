import { type AddressParts, AUSTRALIAN_STATES, type AustralianState } from './types.js';

/**
 * Lightweight Australian street-address parser.
 *
 * Council address searches are picky. Gold Coast returns nothing if you
 * include the state, postcode or "Australia", and Brisbane's dataset wants
 * "PEEL ST" rather than "Peel Street". Adapters therefore work from these
 * parsed parts rather than the raw input.
 */

/** Street types: full name -> common abbreviations (AS 4590 plus everyday usage). */
const STREET_TYPES: Record<string, string[]> = {
  Street: ['st', 'str'],
  Road: ['rd'],
  Avenue: ['ave', 'av'],
  Drive: ['dr', 'drv'],
  Court: ['ct', 'crt'],
  Crescent: ['cres', 'cr'],
  Place: ['pl'],
  Lane: ['ln', 'la'],
  Close: ['cl'],
  Parade: ['pde'],
  Terrace: ['tce', 'terr'],
  Boulevard: ['bvd', 'blvd'],
  Highway: ['hwy'],
  Circuit: ['cct', 'cir'],
  Way: ['wy'],
  Grove: ['gr', 'gve'],
  Esplanade: ['esp'],
  Square: ['sq'],
  Parkway: ['pkwy', 'pwy'],
  Promenade: ['prom'],
  Rise: ['rse'],
  View: ['vw'],
  Track: ['trk'],
  Trail: ['trl'],
  Walk: ['wlk'],
  Mews: [],
  Row: [],
  Loop: ['lp'],
  Quay: ['qy'],
  Glen: ['gln'],
  Green: ['grn'],
  Heights: ['hts'],
  Ridge: ['rdge'],
  Retreat: ['rtt'],
  Vista: ['vsta'],
  Outlook: ['otlk'],
  Gardens: ['gdns'],
  Link: ['lnk'],
  Pass: [],
  Pathway: ['pway'],
  Approach: ['app'],
  Brace: ['brce'],
  Chase: ['ch'],
  Concourse: ['con'],
  Corso: [],
  Crest: ['crst'],
  Cove: [],
  Gateway: ['gwy'],
  Junction: ['jnc'],
  Point: ['pnt'],
  Reserve: ['res'],
  Route: ['rte'],
  Turn: ['trn'],
  Wynd: [],
};

const TYPE_LOOKUP = new Map<string, string>();
for (const [full, abbrevs] of Object.entries(STREET_TYPES)) {
  TYPE_LOOKUP.set(full.toLowerCase(), full);
  for (const a of abbrevs) if (!TYPE_LOOKUP.has(a)) TYPE_LOOKUP.set(a, full);
}

/** Primary abbreviation for a full street type, e.g. "Road" -> "Rd". */
export function abbreviateStreetType(full: string): string {
  const abbrev = STREET_TYPES[full]?.[0];
  return abbrev ? abbrev[0]!.toUpperCase() + abbrev.slice(1) : full;
}

/** Full street type for an abbreviation or full name, e.g. "rd" -> "Road". */
export function expandStreetType(word: string): string | undefined {
  return TYPE_LOOKUP.get(word.toLowerCase().replace(/\.$/, ''));
}

const STATE_NAMES: Record<string, AustralianState> = {
  'australian capital territory': 'ACT',
  'new south wales': 'NSW',
  'northern territory': 'NT',
  queensland: 'QLD',
  'south australia': 'SA',
  tasmania: 'TAS',
  victoria: 'VIC',
  'western australia': 'WA',
};

export function normaliseState(value: string | undefined): AustralianState | undefined {
  if (!value) return undefined;
  const v = value.trim();
  const upper = v.toUpperCase();
  if ((AUSTRALIAN_STATES as readonly string[]).includes(upper)) return upper as AustralianState;
  return STATE_NAMES[v.toLowerCase()];
}

const UNIT_PREFIX =
  /^(?:unit|u|apartment|apt|flat|suite|ste|shop|villa|townhouse)\.?\s*([0-9]+[a-z]?)\s*[,/]?\s*/i;
const SLASH_UNIT = /^([0-9]+[a-z]?)\s*\/\s*/i;
const HOUSE_NUMBER = /^((?:lot\s+)?[0-9]+[a-z]?(?:\s*-\s*[0-9]+[a-z]?)?)\b\s*,?\s*/i;
const STATE_SUFFIX = new RegExp(
  `[,\\s]+(${[...AUSTRALIAN_STATES, ...Object.keys(STATE_NAMES)].join('|')})\\s*$`,
  'i',
);

export function titleCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/(^|[\s'-])([a-z])/g, (_, sep: string, ch: string) => sep + ch.toUpperCase())
    .replace(/\bMc([a-z])/g, (_, ch: string) => `Mc${ch.toUpperCase()}`);
}

export function parseAustralianAddress(input: string): AddressParts {
  let s = input.trim().replace(/\s+/g, ' ');
  const parts: AddressParts = {};

  s = s.replace(/,?\s*australia\s*$/i, '');

  const postcode = /[,\s]+(\d{4})\s*$/.exec(s);
  if (postcode) {
    parts.postcode = postcode[1]!;
    s = s.slice(0, postcode.index);
  }

  const state = STATE_SUFFIX.exec(s);
  if (state) {
    const normalised = normaliseState(state[1]);
    if (normalised) parts.state = normalised;
    s = s.slice(0, state.index);
  }

  s = s.replace(/^[,\s]+|[,\s]+$/g, '');

  const unit = UNIT_PREFIX.exec(s) ?? SLASH_UNIT.exec(s);
  if (unit) {
    parts.unit = unit[1]!.toUpperCase();
    s = s.slice(unit[0].length);
  }

  const house = HOUSE_NUMBER.exec(s);
  if (house) {
    parts.houseNumber = house[1]!.replace(/\s+/g, '').toUpperCase();
    s = s.slice(house[0].length);
  }

  // What's left is "street-name type [,] suburb". The street ends at the first
  // street-type word (after at least one name word), or at the first comma.
  const tokens = s.split(/\s+/).filter(Boolean);
  const commaAt = tokens.findIndex((t) => t.endsWith(','));
  const searchEnd = commaAt === -1 ? tokens.length : commaAt + 1;
  let typeAt = -1;
  for (let i = 1; i < searchEnd; i++) {
    if (expandStreetType(tokens[i]!.replace(/,$/, ''))) {
      typeAt = i;
      break;
    }
  }

  const streetEnd = typeAt !== -1 ? typeAt : commaAt !== -1 ? commaAt : tokens.length - 1;
  const streetTokens = tokens.slice(0, streetEnd + 1).map((t) => t.replace(/,$/, ''));
  const suburb = tokens
    .slice(streetEnd + 1)
    .join(' ')
    .replace(/,/g, '')
    .trim();

  if (streetTokens.length) {
    const fullType = typeAt !== -1 ? expandStreetType(streetTokens.at(-1)!) : undefined;
    if (fullType && streetTokens.length > 1) {
      parts.streetName = titleCase(streetTokens.slice(0, -1).join(' '));
      parts.streetType = fullType;
      parts.street = `${parts.streetName} ${fullType}`;
    } else {
      parts.streetName = titleCase(streetTokens.join(' '));
      parts.street = parts.streetName;
    }
  }
  if (suburb) parts.suburb = titleCase(suburb);

  return parts;
}

/** Format the street line, e.g. "12 Example Road" or (abbreviated) "12 Example Rd". */
export function formatStreetLine(
  parts: AddressParts,
  { abbreviate = false, includeUnit = false } = {},
): string {
  const street =
    parts.streetName && parts.streetType
      ? `${parts.streetName} ${abbreviate ? abbreviateStreetType(parts.streetType) : parts.streetType}`
      : (parts.street ?? '');
  const number = parts.houseNumber
    ? includeUnit && parts.unit
      ? `${parts.unit}/${parts.houseNumber}`
      : parts.houseNumber
    : '';
  return [number, street].filter(Boolean).join(' ');
}

/**
 * True if a council's address line is for the same house (and unit and street,
 * if given). The street check matters: the search is fuzzy enough to return
 * "5 Dudgeon Drive, TALLEBUDGERA" for "5 Tallebudgera Drive".
 */
export function matchesHouseNumber(
  addressLine: string,
  parts: { houseNumber?: string; unit?: string; streetName?: string },
): boolean {
  if (!parts.houseNumber) return true;
  const m =
    /^\s*(?:(?:unit|u)\s*)?(?:([0-9]+[a-z]?)\s*\/\s*)?([0-9]+[a-z]?(?:-[0-9]+[a-z]?)?)\b/i.exec(
      addressLine,
    );
  if (!m) return false;
  const [, unit, number] = m;
  if (number?.toUpperCase() !== parts.houseNumber.toUpperCase()) return false;
  if (parts.streetName) {
    const street = addressLine.slice(m[0].length).split(',')[0]!.trim().toUpperCase();
    const want = parts.streetName.toUpperCase();
    if (street !== want && !street.startsWith(`${want} `)) return false;
  }
  return !parts.unit || !unit || unit.toUpperCase() === parts.unit.toUpperCase();
}

/**
 * The candidates in the user's suburb if any are; otherwise all of them.
 * People (and geocoders) often name the neighbouring suburb, so callers accept
 * a lone leftover as a match and offer several as suggestions.
 */
export function preferSuburb<T>(
  candidates: T[],
  suburbOf: (candidate: T) => string,
  suburb = '',
): T[] {
  const inSuburb = candidates.filter((c) => suburbOf(c).toLowerCase() === suburb.toLowerCase());
  return inSuburb.length ? inSuburb : candidates;
}
