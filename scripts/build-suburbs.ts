/**
 * Writes `src/councils/suburbs.generated.ts`: the suburbs in each supported
 * council's area, for the suburb pages. Run it with `npm run build:suburbs`
 * after adding a council.
 *
 * Suburbs come from the Australian Bureau of Statistics' "Suburbs and
 * Localities" boundaries (2021 edition), and each is given to the council
 * whose area its middle falls in.
 */
import { writeFileSync } from 'node:fs';
import { createServiceFromEnv } from '../src/config.js';
import { createHttpClient, getJson } from '../src/core/http.js';
import { AUSTRALIAN_STATES, type AustralianState } from '../src/core/types.js';
import { type Area, areaContains } from '../src/geo/contains.js';

const LAYER = 'https://geo.abs.gov.au/arcgis/rest/services/ASGS2021/SAL/MapServer/0/query';
const PAGE = 2000;
/** The ABS numbers the states and territories in this order, from 1. */
const STATES = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'] satisfies AustralianState[];

interface Suburb {
  attributes: { sal_name_2021: string; state_code_2021: string };
  geometry?: { rings: number[][][] };
}

/** The middle of a suburb: the centre of mass of its biggest outline, as `[longitude, latitude]`. */
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

const http = createHttpClient();
const coverage = await createServiceFromEnv().coverage();
const suburbs: Record<string, Array<[name: string, latitude: number, longitude: number]>> = {};

for (let offset = 0; ; offset += PAGE) {
  const url = `${LAYER}?${new URLSearchParams({
    where: '1=1',
    outFields: 'sal_name_2021,state_code_2021',
    orderByFields: 'sal_code_2021',
    // Outlines only need to be good enough to find each suburb's middle.
    maxAllowableOffset: '0.0005',
    geometryPrecision: '5',
    outSR: '4326',
    resultOffset: String(offset),
    resultRecordCount: String(PAGE),
    f: 'json',
  })}`;
  const { features = [] } = await getJson<{ features?: Suburb[] }>(http, url);
  for (const { attributes, geometry } of features) {
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
    // The ABS adds the state to names that occur in several, e.g. "Richmond (Vic.)".
    const name = attributes.sal_name_2021.replace(/\s*\(.*\)$/, '');
    const id = council.properties.council;
    suburbs[id] ??= [];
    const list = suburbs[id];
    if (!list.some(([existing]) => existing === name)) {
      list.push([name, Number(latitude.toFixed(4)), Number(longitude.toFixed(4))]);
    }
  }
  if (features.length < PAGE) break;
}

const sorted = Object.fromEntries(
  Object.entries(suburbs)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([council, list]) => [council, list.sort(([a], [b]) => a.localeCompare(b))]),
);
writeFileSync(
  'src/councils/suburbs.generated.ts',
  `// Written by \`npm run build:suburbs\`. Do not edit.\n// Suburb names and locations: Australian Bureau of Statistics, ASGS Edition 3 (2021), CC BY 4.0.\nexport const SUBURBS: Record<string, Array<[name: string, latitude: number, longitude: number]>> = ${JSON.stringify(sorted)};\n`,
);
const count = Object.values(sorted).reduce((total, list) => total + list.length, 0);
console.log(`${count} suburbs in ${Object.keys(sorted).length} councils`);
