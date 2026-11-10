# How it works

```
address ─► parse ─► geocode ─► find the council ─► council adapter ─► expand dates ─► response
```

1. **Parse** the address into parts (`src/core/address.ts`). Council searches are picky; some return nothing if you include the postcode.
2. **Geocode** it to a latitude and longitude (`src/geo/nominatim.ts`, using OpenStreetMap).
3. **Find the council** whose area contains that point, using the Australian Bureau of Statistics' boundary service (`src/geo/abs-lga.ts`). Each council area has an official code, and that code picks the adapter, so "which council is this?" never depends on suburb names.
4. **Ask the council adapter** for the property's bins. Each bin comes back as a type plus how it repeats: every N days from a known date, or an explicit list of dates.
5. **Expand** those into the dates in the requested range (`src/core/schedule.ts`). This is shared code, so adapters never deal with date ranges.

## Wrong suburbs

People often name the neighbouring suburb. If nothing matches in the suburb given, adapters look across the whole council and accept a match only when it is unambiguous. Otherwise the error lists `suggestions` to choose from.

## Caching

Lookups are cached: geocodes for 30 days and council areas for 90 days. A property's schedule is fetched at most once a day, and the copy is kept for a week, so if a council's site is down the last known schedule is used instead of failing. API responses also tell a CDN in front (such as Vercel's) to keep each answer until midnight in the council's timezone, since that is when it changes.

`/health` reports which cache is in use and whether it is working. The cache is in memory by default; it can live in a SQLite file or in Redis instead (see [Configuration and deploying](deploying.md)).

## The website

`web/` is a React app (Vite, Mantine, Motion, MapLibre). It is built into `public/`.

The server also adds real content to each page before sending it (`src/api/site.ts`), so search engines and AI assistants can read the site without running JavaScript:

- `/` and a landing page per council at `/bin-day/<state>/<council>`, each with its own title, description and structured data
- `/sitemap.xml` and `/robots.txt`
- `/llms.txt`, a plain-language guide to the API for AI assistants

All of it is generated from the list of councils, so a new council gets its page and its sitemap entry automatically.

## Using it as a library

```ts
import { BinDaysService } from 'bin-days';

const result = await new BinDaysService().lookup({ address: '35 Peel St South Brisbane' });
```
