# Bin Days

Which bins go out, and when, for an Australian street address.

Type an address into the website, or send it to the API, and get the next collection day and the bins to put out. The answer has the same shape for every council.

**Try it:** https://bin-days-rho.vercel.app

## Quick start

You need Node 22 or newer.

```bash
npm install
npm run dev
```

Then open http://localhost:3000, or ask from the command line:

```bash
npm run cli -- "833 Southport Nerang Road, Nerang QLD"
```

```
833 Southport Nerang Road, NERANG 4211  (City of Gold Coast)
2026-11-10 → 2026-11-23

2026-11-16  Monday     General waste, Green organics
2026-11-23  Monday     General waste*, Recycling

* projected from the regular cycle. Public holidays may shift these.
```

## API

| Endpoint                             | Returns                                         |
| ------------------------------------ | ----------------------------------------------- |
| `GET /v1/collections?address=<text>` | Collection days and bins for that address       |
| `GET /v1/councils`                   | The councils supported so far                   |
| `GET /v1/coverage`                   | A map (GeoJSON) of the areas those councils cover |

`/v1/collections` also takes `date=YYYY-MM-DD`, or `from` and `to` for a range. Without them you get the next two weeks.

```jsonc
{
  "address": { "matched": "833 Southport Nerang Road, NERANG 4211" },
  "council": { "id": "qld/gold-coast", "name": "City of Gold Coast" },
  "next": {
    "date": "2026-11-16",
    "weekday": "Monday",
    "bins": [
      { "type": "general", "name": "General waste", "colour": "red", "confidence": "confirmed" },
      { "type": "organics", "name": "Green organics", "colour": "lime", "confidence": "confirmed" }
    ]
  },
  "days": [ /* every collection day in the range, same shape as "next" */ ],
  "services": [ /* each bin and how often it is collected */ ]
}
```

The full reference, with every field and error, is the interactive documentation at [`/docs`](https://bin-days-rho.vercel.app/docs).

## Where it works

138 councils so far, across South Australia, New South Wales, Victoria, Queensland, the ACT, Tasmania and Western Australia. See [PROGRESS.md](PROGRESS.md) for the list and what is planned next.

## Project layout

```
src/
  core/         dates, schedules, address parsing, caching
  geo/          turning an address into a location, and a location into a council
  platforms/    adapters for systems that many councils share
  councils/     one small file per council
  api/          the HTTP API and the website's pages
web/            the website (React), built into public/
test/           unit tests, plus live tests against the real council services
```

More detail:

- [How it works](docs/how-it-works.md)
- [Adding a council](docs/adding-a-council.md)
- [Configuration and deploying](docs/deploying.md)

## Contributing

Contributions are welcome, and the most useful one is a new council.

1. Check [PROGRESS.md](PROGRESS.md) to see what is already covered and what is wanted.
2. Follow [Adding a council](docs/adding-a-council.md). If the council uses a platform we already support, it is a few lines of configuration.
3. Before opening a pull request, run:

   ```bash
   npm test
   npm run typecheck
   npm run lint
   ```

4. If you changed anything in `web/`, run `npm run build:web` and commit the `public/` folder with it.

Found a wrong bin day, or an address that should work and doesn't? [Open an issue](https://github.com/dan-garden/bin-days/issues) with the address and the council.

## Licence

[MIT](LICENSE.md). Made by [Dan Garden](https://github.com/dan-garden).
