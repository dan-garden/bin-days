# Configuration and deploying

## Commands

```bash
npm run dev          # the API and website on http://localhost:3000
npm run dev:web      # the website with hot reload, using the API on :3000
npm run build:web    # build the website into public/
npm run build && npm start   # production build and run

npm test             # unit tests (offline)
npm run test:live    # tests against the real council services
npm run typecheck
npm run lint
```

## Settings

All optional, set as environment variables. `.env.example` has a template.

| Variable | What it does |
| --- | --- |
| `BIN_DAYS_USER_AGENT` | Identifies you to the services the app calls. **Set this in production**; the public geocoder requires it. Example: `bin-days/2.0 (https://github.com/you/bin-days)` |
| `SITE_URL` | The site's public address, used for canonical links and the sitemap. Set it once the site has its own domain. |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Keep the cache in Upstash Redis. For hosts with no disk, such as Vercel. |
| `BIN_DAYS_CACHE_PATH` | Keep the cache in a SQLite file, e.g. `.cache/bin-days.db`. For hosts with a disk. |
| `NOMINATIM_URL` | Use your own geocoder instead of the public one, which allows one request a second. |
| `PORT` | The port to listen on. Defaults to 3000. |

Without a cache setting, the cache is in memory and is lost on restart.

## Deploying to Vercel

The repo is set up for Vercel's Hono preset: `src/app.ts` is the entry point, `public/` is served as static files, and `vercel.json` runs the app in Sydney.

1. Import the repo in Vercel and choose the **Hono** preset. No build settings are needed.
2. Set `BIN_DAYS_USER_AGENT`.
3. Add an Upstash Redis database from the Storage tab, so lookups are remembered between requests.

Two things to know:

- **`public/` is committed.** Vercel lists a project's static files before it runs any build, so files generated during its build are never served. After changing anything in `web/`, run `npm run build:web` and commit `public/` with it.
- **The public geocoder is for light use.** Its one-request-a-second limit is applied per running copy of the app, so point `NOMINATIM_URL` at your own geocoder before sending real traffic.

## Deploying elsewhere

Any host that runs Node works: `npm run build && npm start`. With a disk that survives restarts, set `BIN_DAYS_CACHE_PATH` and skip Redis.
