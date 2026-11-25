/**
 * Writes `src/councils/suburbs.generated.ts`: the suburbs in each supported
 * council's area, with each one's postcode, for the suburb pages. Run it with
 * `npm run build:suburbs` after adding a council.
 *
 * Suburbs and postcodes come from the Australian Bureau of Statistics'
 * "Suburbs and Localities" and "Postal Areas" boundaries (2021 edition). Each
 * suburb is given to the council, and the postcode, whose area its middle falls in.
 */
import { writeFileSync } from 'node:fs';
import { createServiceFromEnv } from '../src/config.js';
import { createHttpClient, getJson } from '../src/core/http.js';
import { AUSTRALIAN_STATES, type AustralianState } from '../src/core/types.js';
import { type Bounds, boundsOf } from '../src/geo/bounds.js';
import { type Area, areaContains } from '../src/geo/contains.js';

const ABS = 'https://geo.abs.gov.au/arcgis/rest/services/ASGS2021';
const PAGE = 2000;
/** The ABS numbers the states and territories in this order, from 1. */
const STATES = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'] satisfies AustralianState[];

interface Feature {
  attributes: Record<string, string>;
  geometry?: { rings: number[][][] };
}

const http = createHttpClient();

/** Every feature of an ABS boundary layer, with outlines simplified to about 50 metres. */
async function readLayer(layer: string, fields: string[]): Promise<Feature[]> {
  const all: Feature[] = [];
  for (let offset = 0; ; offset += PAGE) {
    const url = `${ABS}/${layer}/MapServer/0/query?${new URLSearchParams({
      where: '1=1',
      outFields: fields.join(','),
      orderByFields: fields[0] ?? '',
      maxAllowableOffset: '0.0005',
      geometryPrecision: '5',
      outSR: '4326',
      resultOffset: String(offset),
      resultRecordCount: String(PAGE),
      f: 'json',
    })}`;
    const { features = [] } = await getJson<{ features?: Feature[] }>(http, url);
    all.push(...features);
    if (features.length < PAGE) return all;
  }
}

/** The middle of an area: the centre of mass of its biggest outline, as `[longitude, latitude]`. */
function middle(rings: number[][][] = []): [number, number] | undefined {
  let best: { area: number; point: [number, number] } | undefined;
  for (const ring of rings) {
    let area = 0;
    let x = 0;
    let y = 0;
    for (let i = 0; i < ring.length - 1; i++) {
      const [x1, y1] = ring[i] as [number, number];
      const [x2, y2] = ring[i + 1] as [number, number];
      const cross = x1 * y2 - x2 * y1;
      area += cross;
      x += (x1 + x2) * cross;
      y += (y1 + y2) * cross;
    }
    if (area && (!best || Math.abs(area) > best.area)) {
      best = { area: Math.abs(area), point: [x / (3 * area), y / (3 * area)] };
    }
  }
  return best?.point;
}

/** Whether ArcGIS outlines (several parts, with holes) enclose a point: inside an odd number of them. */
const encloses = (rings: number[][][], longitude: number, latitude: number) =>
  rings.filter((ring) =>
    areaContains({ type: 'Polygon', coordinates: [ring] }, { latitude, longitude }),
  ).length %
    2 ===
  1;

const coverage = await createServiceFromEnv().coverage();
const postcodes = (await readLayer('POA', ['poa_code_2021'])).flatMap(
  ({ attributes, geometry }) => {
    const bounds = boundsOf(geometry?.rings);
    return bounds && geometry
      ? [{ code: attributes.poa_code_2021 ?? '', bounds, rings: geometry.rings }]
      : [];
  },
);
const within = ([west, south, east, north]: Bounds, longitude: number, latitude: number) =>
  longitude >= west && longitude <= east && latitude >= south && latitude <= north;

type Row = [name: string, latitude: number, longitude: number, postcode?: string];
const suburbs: Record<string, Row[]> = {};

for (const { attributes, geometry } of await readLayer('SAL', [
  'sal_code_2021',
  'sal_name_2021',
  'state_code_2021',
])) {
  const state = STATES[Number(attributes.state_code_2021) - 1];
  const point = middle(geometry?.rings);
  if (!state || !AUSTRALIAN_STATES.includes(state) || !point) continue;
  // shortcut: a suburb goes to the one council its middle is in; one split between two
  // councils is only listed under that one.
  const [longitude, latitude] = point;
  const council = coverage.features.find(
    (area) =>
      area.properties.state === state &&
      areaContains(area.geometry as Area, { latitude, longitude }),
  );
  if (!council) continue;
  // A suburb can span several postcodes; this is the one its middle is in.
  const postcode = postcodes.find(
    (area) => within(area.bounds, longitude, latitude) && encloses(area.rings, longitude, latitude),
  )?.code;
  // The ABS adds the state to names that occur in several, e.g. "Richmond (Vic.)".
  const name = (attributes.sal_name_2021 ?? '').replace(/\s*\(.*\)$/, '');
  const id = council.properties.council;
  suburbs[id] ??= [];
  const list = suburbs[id];
  if (!list.some(([existing]) => existing === name)) {
    const [lat, lon] = [Number(latitude.toFixed(4)), Number(longitude.toFixed(4))];
    list.push(postcode ? [name, lat, lon, postcode] : [name, lat, lon]);
  }
}

const sorted = Object.fromEntries(
  Object.entries(suburbs)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([council, list]) => [council, list.sort(([a], [b]) => a.localeCompare(b))]),
);
writeFileSync(
  'src/councils/suburbs.generated.ts',
  `// Written by \`npm run build:suburbs\`. Do not edit.\n// Suburbs, postcodes and locations: Australian Bureau of Statistics, ASGS Edition 3 (2021), CC BY 4.0.\nexport const SUBURBS: Record<\n  string,\n  Array<[name: string, latitude: number, longitude: number, postcode?: string]>\n> = ${JSON.stringify(sorted)};\n`,
);
const rows = Object.values(sorted).flat();
console.log(
  `${rows.length} suburbs in ${Object.keys(sorted).length} councils, ${rows.filter((row) => row[3]).length} with a postcode`,
);
