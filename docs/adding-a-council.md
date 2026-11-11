# Adding a council

## 1. Find where its bin days come from

Open the council's "find my bin day" page with your browser's developer tools on the Network tab, and look up an address. In order of preference:

1. **A platform we already support.** Many councils share one, and then the council is a few lines of configuration. See the table below.
2. **An open dataset** (a `data.*.gov.au` portal). These are the most stable.
3. **A JSON API** the page calls.
4. **Scraping the page's HTML**, as a last resort.

| Platform          | How to recognise it                                                    | Example                         |
| ----------------- | ---------------------------------------------------------------------- | ------------------------------- |
| waste-info.com.au | `https://<council>.waste-info.com.au/api/v1/streets.json` returns JSON | `src/councils/qld/redland.ts`   |
| Granicus OpenCities | `<council site>/api/v1/myarea/search?keywords=...` returns JSON      | `src/councils/qld/gold-coast.ts` |
| Opendatasoft      | A data portal with `/api/explore/v2.1/` addresses                      | `src/councils/qld/brisbane.ts`  |
| My Local Services | The council is in South Australia and listed in the state's My Local Services app | `src/councils/sa/robe.ts` |
| IntraMaps | The council's "find my bin day" opens a map on `*.spatial.t1cloud.com` or a path containing `IntraMaps` | `src/councils/wa/swan.ts` |
| ArcGIS map layer | A map layer (`.../FeatureServer/0`) of zones or properties, with a date or a weekday per bin | `src/councils/tas/launceston.ts` (dates), `src/councils/nsw/newcastle.ts` (weekday and week), `src/councils/vic/moonee-valley.ts` (found by address) |
| Zone file | The council's map is a Pozi site (`<council>.pozi.com`) whose config (`https://config.pozi.com/public/production/<council>.json`) names a GeoJSON file of zones, or the council has a "garbage collection zones" dataset on data.gov.au | `src/councils/vic/frankston.ts` (standard fields), `src/councils/vic/greater-bendigo.ts` (its own fields) |
| Pozi map server | A Pozi site with no zone file: its map lists a "QGIS Project" dataset to query | `src/councils/wa/vincent.ts` (by address), `src/councils/vic/northern-grampians.ts` (by map point) |

Council sites often refuse requests that look anonymous or pretend to be a browser, but answer ones that say who they are. The app sends an identifying `User-Agent` (see `BIN_DAYS_USER_AGENT`); test with that, and if a site still refuses, leave it alone rather than work around it.

## 2. Find the council's area code

Every council area has a code from the Australian Bureau of Statistics. The quickest way to get it is to look up any address in that council: the "not supported yet" error includes the code.

```bash
npm run cli -- "1 Example Street, Suburb NSW"
```

## 3. Write the adapter

Create `src/councils/<state>/<name>.ts`. For a supported platform it is only configuration:

```ts
import { createWasteInfoCouncil } from '../../platforms/waste-info.js';

/** Example City Council, on waste-info.com.au. */
export const example = createWasteInfoCouncil({
  id: 'nsw/example',
  name: 'Example City Council',
  state: 'NSW',
  lgaCodes: ['12345'],
  timezone: 'Australia/Sydney',
  subdomain: 'example',
});
```

Otherwise implement `CouncilAdapter`, as `src/councils/qld/brisbane.ts` does. It is one function, `getSchedule(address, ctx)`, which returns the matched address and its bins. Use `ctx.http` rather than `fetch`, so the adapter can be tested without the network.

Most councils' own lookups work the same way: search for the address, pick the right result, then ask for that property's bins. `searchLine` and `pickAddress` in `src/core/address.ts` do the first two steps, as `src/councils/wa/murray.ts` shows.

For an IntraMaps council, `readIntraMapsPanel` in `src/platforms/intramaps.ts` returns every field of a property's panel, which shows which fields are bins and how the council words them.

A source that only gives a weekday and "week 1 or 2" is not enough on its own: a week number means nothing without a date to count from, and guessing it tells people the wrong bin. Add such a council only with a date from the council itself, and say in the file where it came from. Three places have had one:

- the council's public ArcGIS map, whose pop-up formula often names the date it counts from (search the council's maps on arcgis.com and read the web map's `expressionInfos`);
- the script behind the council's own bin day page;
- the council's printed calendar.

`weekdayInWeekOf` in `src/core/date.ts` turns a weekday and a date in the right week into a collection date, and `binService` in `src/core/schedule.ts` builds a bin from a date and a cycle.

If you find a platform that several councils share, put it in `src/platforms/` so each of those councils becomes a few lines.

## 4. Register it

Add it to the list in `src/councils/index.ts`. Its landing page and sitemap entry appear automatically.

## 5. Test it

- Add one real address for the council to `test/live/councils.test.ts`, then run `npm run test:live`. Prefer a public building over someone's home.
- For a new platform or a hand-written adapter, add a unit test with a saved response in `test/fixtures/`.
- Add the council to [PROGRESS.md](../PROGRESS.md).
