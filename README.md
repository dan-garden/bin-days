# bin-days

An Australian bin collection API. Give it an address and a date (or range); it tells you which bins go out on which days, in the same response shape whatever council the address is in.

```bash
npm install
npm run cli -- "833 Southport Nerang Road, Nerang QLD"
```

```
833 Southport Nerang Road, NERANG 4211  (City of Gold Coast)
2026-11-10 → 2026-11-23

2026-11-16  Monday     General waste, Green organics
2026-11-23  Monday     General waste*, Recycling

* projected from the regular cycle. Public holidays may shift these.
```

## Supported councils

| Council               | Id               | Source                                                                                                                       |
| --------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| City of Gold Coast    | `qld/gold-coast` | Council website (OpenCities platform)                                                                                        |
| Brisbane City Council | `qld/brisbane`   | Official open dataset ([Bin Collection Calendar](https://data.brisbane.qld.gov.au/explore/dataset/bin-collection-calendar/)) |
| Liverpool City Council | `nsw/liverpool` | Official open dataset ([Bin collection days](https://data.liverpool.nsw.gov.au/explore/dataset/bin-collection-days/)) |
| Redland City Council  | `qld/redland`    | waste-info.com.au calendar |
| Cumberland City Council | `nsw/cumberland` | waste-info.com.au calendar |
| Penrith City Council  | `nsw/penrith`    | waste-info.com.au calendar |
| Wollongong City Council | `nsw/wollongong` | waste-info.com.au calendar |
| City of Ballarat | `vic/ballarat` | waste-info.com.au calendar |
| Baw Baw Shire Council | `vic/baw-baw` | waste-info.com.au calendar |
| Benalla Rural City Council | `vic/benalla` | waste-info.com.au calendar |
| Horsham Rural City Council | `vic/horsham` | waste-info.com.au calendar |
| Moira Shire Council | `vic/moira` | waste-info.com.au calendar |
| Murrindindi Shire Council | `vic/murrindindi` | waste-info.com.au calendar |
| Wellington Shire Council | `vic/wellington` | waste-info.com.au calendar |
| Bayside Council | `nsw/bayside` | waste-info.com.au calendar |
| Bega Valley Shire Council | `nsw/bega-valley` | waste-info.com.au calendar |
| Bellingen Shire Council | `nsw/bellingen` | waste-info.com.au calendar |
| Blue Mountains City Council | `nsw/blue-mountains` | waste-info.com.au calendar |
| Burwood Council | `nsw/burwood` | waste-info.com.au calendar |
| Campbelltown City Council | `nsw/campbelltown` | waste-info.com.au calendar |
| City of Canada Bay | `nsw/canada-bay` | waste-info.com.au calendar |
| Clarence Valley Council | `nsw/clarence-valley` | waste-info.com.au calendar |
| City of Coffs Harbour | `nsw/coffs-harbour` | waste-info.com.au calendar |
| Cowra Shire Council | `nsw/cowra` | waste-info.com.au calendar |
| Forbes Shire Council | `nsw/forbes` | waste-info.com.au calendar |
| Gwydir Shire Council | `nsw/gwydir` | waste-info.com.au calendar |
| Inner West Council | `nsw/inner-west` | waste-info.com.au calendar |
| Ku-ring-gai Council | `nsw/ku-ring-gai` | waste-info.com.au calendar |
| Lithgow City Council | `nsw/lithgow` | waste-info.com.au calendar |
| Moree Plains Shire Council | `nsw/moree-plains` | waste-info.com.au calendar |
| Port Macquarie-Hastings Council | `nsw/port-macquarie-hastings` | waste-info.com.au calendar |
| Port Stephens Council | `nsw/port-stephens` | waste-info.com.au calendar |
| Queanbeyan-Palerang Regional Council | `nsw/queanbeyan-palerang` | waste-info.com.au calendar |
| Snowy Valleys Council | `nsw/snowy-valleys` | waste-info.com.au calendar |
| Gympie Regional Council | `qld/gympie` | waste-info.com.au calendar |
| Livingstone Shire Council | `qld/livingstone` | waste-info.com.au calendar |
| South Burnett Regional Council | `qld/south-burnett` | waste-info.com.au calendar |

`GET /v1/councils` always returns the current list. Run `npm run cli -- --list` to print it.

## API

```bash
npm run dev            # http://localhost:3000 (API + web UI)
npm run build && npm start
```

Interactive docs are at `/docs` (Swagger UI) and the OpenAPI 3.1 spec at `/openapi.json`. Both are generated from the zod schemas in `src/api/openapi.ts`.

### `GET /v1/collections`

| Param        |                                                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `address`    | Required. Any reasonable Australian address format: `2/35 Peel St, South Brisbane QLD 4101`, `833 southport nerang rd nerang` |
| `date`       | A single day, `YYYY-MM-DD`                                                                                                |
| `from`, `to` | An inclusive range (max 366 days). Defaults to today → +13 days in the council's timezone                                 |
| `council`    | Optional. Skip geocoding and use this council id                                                                          |

```jsonc
{
  "address": {
    "input": "833 Southport Nerang Rd Nerang",
    "matched": "833 Southport Nerang Road, NERANG 4211",    // as the council knows it
    "geocoded": "Southport Nerang Road, Nerang, Queensland, 4211, Australia",
    "parts": { "houseNumber": "833", "street": "Southport Nerang Road", "suburb": "Nerang", "state": "QLD", ... },
    "latitude": -27.99, "longitude": 153.34,
    "lga": { "code": "33430", "name": "Gold Coast" }
  },
  "council": { "id": "qld/gold-coast", "name": "City of Gold Coast", "state": "QLD", ... },
  "timezone": "Australia/Brisbane",
  "today": "2026-11-10",
  "range": { "from": "2026-11-10", "to": "2026-11-23" },
  "services": [
    { "type": "general",   "name": "General waste",  "colour": "red",    "frequency": "weekly",      "everyDays": 7,  "next": "2026-11-16" },
    { "type": "recycling", "name": "Recycling",      "colour": "yellow", "frequency": "fortnightly", "everyDays": 14, "next": "2026-11-23" },
    { "type": "organics",  "name": "Green organics", "colour": "lime",   "frequency": "fortnightly", "everyDays": 14, "next": "2026-11-16" }
  ],
  "days": [   // only days with a collection
    { "date": "2026-11-16", "weekday": "Monday", "bins": [
      { "type": "general",  "name": "General waste",  "colour": "red",  "confidence": "confirmed" },
      { "type": "organics", "name": "Green organics", "colour": "lime", "confidence": "confirmed" }
    ]},
    ...
  ],
  "next": { "date": "2026-11-16", "weekday": "Monday", "bins": [ ... ] }
}
```

- **`type`** is always one of `general`, `recycling`, `organics`, `food`, `glass`, `bulky`, `other`. `name` keeps the council's own wording.
- **`confidence`**: `confirmed` means the council stated that exact date. `projected` means it was calculated from the weekly/fortnightly cycle, and public holidays can move it.

Errors use one shape, `{ "error": { "code", "message", ... } }`:

| Status | Code                             | When                                                                              |
| ------ | -------------------------------- | --------------------------------------------------------------------------------- |
| 400    | `INVALID_INPUT`                  | Bad params                                                                        |
| 404    | `ADDRESS_NOT_FOUND`              | Couldn't locate the address (includes `suggestions` when the council offers them) |
| 422    | `COUNCIL_NOT_SUPPORTED`          | Address is valid, but its council isn't supported yet (includes the `lga` found)  |
| 502    | `UPSTREAM_ERROR` / `PARSE_ERROR` | A council site is down or has changed                                             |

### `GET /v1/councils?state=QLD`

The supported councils.

### `GET /v1/coverage`

A GeoJSON `FeatureCollection` with one feature per supported council area (`properties`: `council`, `name`, `state`), for drawing a coverage map. Outlines come from the ABS boundary service, simplified to about 200 m.

## Web UI

`web/` is a React single-page app (Vite, Mantine, Motion, MapLibre): address lookup with the next collection and the days after it, the supported councils by state, and a map of the areas they cover. It remembers the last address you submitted in the browser's local storage.

```bash
npm run dev          # the API on :3000
npm run dev:web      # the UI with hot reload, proxying API calls to :3000
npm run build:web    # build the UI into public/
```

### Pages for search engines and language models

The app serves more than the API (`src/api/site.ts`), all generated from the council registry:

- `/` and one landing page per council at `/bin-day/<state>/<council>` (e.g. `/bin-day/qld/brisbane`). Each is the UI's HTML with that page's own title, description, canonical link, structured data and plain-HTML content put in on the server, so it reads properly without JavaScript.
- `/sitemap.xml` and `/robots.txt`.
- `/llms.txt`, a plain-language guide to the API for AI assistants.

Adding a council adds its landing page and its sitemap entry. Set `SITE_URL` once the site has its own domain, so canonical links and the sitemap use it.

`public/` is the built UI and **is committed**: Vercel lists a project's static files before it runs any build script, so files generated during its build are never served. After changing anything in `web/`, run `npm run build:web` and commit `public/` with it.

## How it works

```
address ─► parse ─► geocode ─► ABS LGA lookup ─► council adapter ─► expand dates ─► response
          (core)   (Nominatim)  (point-in-polygon)  (per council)     (core)
```

1. **Parse** the address into parts (`src/core/address.ts`). Council searches are picky; Gold Coast returns nothing if you include the postcode.
2. **Geocode** to lat/lon (`src/geo/nominatim.ts`, OpenStreetMap).
3. **Find the Local Government Area** containing that point via the ABS's official boundary service (`src/geo/abs-lga.ts`). The LGA code is the routing key, so "which council is this?" never depends on fuzzy suburb names.
4. **Ask the council adapter** for the property's services. Each service is a type plus a _recurrence_ (every N days from an anchor date, or an explicit date list).
5. **Expand** recurrences over the requested range (`src/core/schedule.ts`). This lives in the core, so adapters never deal with date ranges.

Everything is cached in memory (geocodes 30 days, LGAs 90 days, schedules 6 hours). If the suburb is wrong (people often name the next one over), adapters look council-wide and accept the match only when it is unambiguous; otherwise the error lists `suggestions`. Set `BIN_DAYS_CACHE_PATH` to keep the cache in a SQLite file instead, or implement the `Cache` interface to use Redis or similar.

```
src/
  core/         types, dates, schedule expansion, address parser, bin classifier, cache, http, errors
  geo/          Geocoder + LgaResolver interfaces, Nominatim and ABS implementations
  platforms/    reusable adapters for council website platforms (OpenCities, Opendatasoft, waste-info)
  councils/     one file per council, plus the registry (councils/index.ts)
  api/          Hono HTTP app
  service.ts    the orchestrator: BinDaysService.lookup()
  server.ts     Node HTTP server
  cli.ts        command line
web/            the React web UI (built into public/)
```

## Adding a council

1. **Find the LGA code** from the [ABS ASGS 2024 LGA service](https://geo.abs.gov.au/arcgis/rest/services/ASGS2024/LGA/MapServer/0), or run any address in that council through the API; the `COUNCIL_NOT_SUPPORTED` error includes it.
2. **Work out where its data comes from.** Open the council's "find my bin day" page with browser dev tools on the Network tab. In rough order of preference:
   - an **open dataset** (data.\*.gov.au, Opendatasoft, CKAN), which is the most stable
   - a **known platform**. Many councils share one, so check `src/platforms/` first
   - a JSON API the page calls
   - scraping HTML, as a last resort
3. **Write the adapter** at `src/councils/<state>/<name>.ts`. For a platform council it's just config:

   ```ts
   export const logan = createOpenCitiesCouncil({
     id: 'qld/logan',
     name: 'Logan City Council',
     state: 'QLD',
     lgaCodes: ['34590'],
     timezone: 'Australia/Brisbane',
     baseUrl: 'https://www.logan.qld.gov.au',
   });
   ```

   Otherwise implement `CouncilAdapter` (see `src/councils/qld/brisbane.ts`): one `getSchedule(address, ctx)` that returns `{ matchedAddress, services }`. Use `ctx.http` (never global `fetch`) so it's testable. Use `classifyBin()` for labels, `parseAustralianDate()` for dates, and `parseFrequency()` for "Collected fortnightly".
4. **Register it** in `src/councils/index.ts`.
5. **Test it**: add a unit test with a saved response in `test/fixtures/`, and a sample address in `test/live/councils.test.ts`.

If you find a platform that several councils share, put it in `src/platforms/`. Then each of those councils is a few lines of config.

### Platforms worth knowing about

- **Granicus OpenCities** (`/api/v1/myarea/search`). Used by many councils. Several (e.g. Logan, Ipswich, Moreton Bay, Redland, Parramatta, Hornsby) sit behind Akamai bot protection that blocks scripted requests, so check before adding them.
- **Opendatasoft** portals (`/api/explore/v2.1/...`), e.g. Brisbane.
- **waste-info.com.au** (`<council>.waste-info.com.au/api/v1/...`, streets → properties → calendar), in `src/platforms/waste-info.ts`. A new council on it is a few lines of config; see `src/councils/qld/redland.ts`.

## Development

```bash
npm test             # unit tests (offline, uses fixtures)
npm run test:live    # hits the real councils, run when adding one or on a schedule
npm run typecheck
npm run lint         # Biome
```

Configuration (see `.env.example`):

- `BIN_DAYS_USER_AGENT`: an identifying User-Agent with contact details. **Set this in production.** The public Nominatim instance requires it.
- `NOMINATIM_URL`: point at a self-hosted Nominatim to lift the 1 request/second limit.
- `BIN_DAYS_CACHE_PATH`: a SQLite file for the cache, e.g. `.cache/bin-days.db`, so geocodes and schedules survive restarts. Unset means in-memory. Node prints an "experimental feature" warning for its built-in SQLite module when this is set.
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`: keep the cache in Upstash Redis instead, for hosts with no persistent disk.
- `SITE_URL`: the site's public address, for canonical links and the sitemap. Defaults to the address each request arrives on.
- `PORT`

### Deploying to Vercel

The repo is set up for Vercel's Hono support: `src/app.ts` is the entrypoint, `public/` is served by the CDN, and `vercel.json` pins functions to Sydney (`syd1`), close to the council sites.

1. Import the repo in Vercel (or run `vercel`). No build settings are needed.
2. Set `BIN_DAYS_USER_AGENT`.
3. Add an Upstash Redis database (Vercel Marketplace → Upstash) so geocodes survive between invocations. Without it the app still works, but every cold start begins with an empty cache.

The geocoder's one-request-per-second throttle is per function instance, so point `NOMINATIM_URL` at your own instance before sending real traffic.

Use it as a library:

```ts
import { BinDaysService } from 'bin-days';
const result = await new BinDaysService().lookup({
  address: '35 Peel St South Brisbane',
  from,
  to,
});
```

## Known limitations

- **Geocoding** uses free OpenStreetMap data. Ambiguous inputs like "10 Bourke St Melbourne" (without a postcode) can resolve to the wrong Bourke St. Including the postcode fixes it. For national coverage, add a G-NAF-based `Geocoder` (e.g. Geoscape); the interface is in `src/geo/types.ts`.
- **Public holidays**: dates after the first one the council confirms are projected. Councils that publish holiday changes could provide `dates` recurrences instead.
- **Council sites change.** Run `npm run test:live` regularly (e.g. weekly CI) to catch breakage.
