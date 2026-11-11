import { z } from 'zod';
import { isLocalDate } from '../core/date.js';
import { AUSTRALIAN_STATES, BIN_TYPES, type LocalDate } from '../core/types.js';

/**
 * The HTTP contract as zod schemas. `GET /openapi.json` is generated from
 * these, and the API tests parse real responses with them (strictly), so the
 * published spec can't drift from what the API returns.
 */
const date = z.string().meta({ format: 'date', examples: ['2026-11-13'] });

const dateParam = (description: string) =>
  z
    .string()
    .refine(isLocalDate, 'Expected a date formatted YYYY-MM-DD')
    .transform((d) => d as LocalDate)
    .optional()
    .meta({ format: 'date', description });

export const CollectionsQuery = z.object({
  address: z
    .string()
    .trim()
    .min(1, 'address is required')
    .max(300)
    .meta({
      description: 'Any reasonable Australian address format.',
      examples: ['833 Southport Nerang Rd Nerang', '201/35 Peel St, South Brisbane QLD 4101'],
    }),
  date: dateParam('A single day. Shorthand for `from` = `to`.'),
  from: dateParam("Start of range, inclusive. Defaults to today in the council's timezone."),
  to: dateParam('End of range, inclusive (max 366 days). Defaults to `from` + 13 days.'),
  council: z
    .string()
    .optional()
    .meta({ description: 'Skip geocoding and use this council id.', examples: ['qld/brisbane'] }),
});

export const CalendarQuery = CollectionsQuery.pick({ address: true, council: true }).extend({
  reminder: z.coerce
    .number()
    .int()
    .min(0)
    .max(23)
    .optional()
    .meta({
      description:
        'Add a reminder to each event at this hour (0 to 23) the evening before. None if left out.',
      examples: [18],
    }),
});

export const CouncilsQuery = z.object({
  state: z
    .string()
    .optional()
    .meta({ description: 'Filter by state.', examples: ['QLD'] }),
});

const binType = z.enum(BIN_TYPES);
const state = z.enum(AUSTRALIAN_STATES);

const Council = z.strictObject({
  id: z.string().meta({ examples: ['qld/gold-coast'] }),
  name: z.string(),
  state,
  lgaCodes: z.array(z.string()).meta({ description: 'ABS Local Government Area codes covered.' }),
  timezone: z.string().meta({ examples: ['Australia/Brisbane'] }),
  website: z.string().optional(),
  platform: z.string().optional(),
});

const Day = z.strictObject({
  date,
  weekday: z.enum(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']),
  bins: z.array(
    z.strictObject({
      type: binType,
      name: z.string().meta({ description: "The council's own label." }),
      colour: z.string().optional().meta({ description: 'Lid colour.' }),
      confidence: z.enum(['confirmed', 'projected']).meta({
        description:
          '`confirmed`: the council stated this exact date. `projected`: calculated from the cycle; public holidays can move it.',
      }),
    }),
  ),
});

export const CollectionsResponse = z.strictObject({
  address: z.strictObject({
    input: z.string(),
    matched: z.string().meta({ description: 'The address as the council knows it.' }),
    geocoded: z.string().optional(),
    parts: z.strictObject({
      unit: z.string().optional(),
      houseNumber: z.string().optional(),
      street: z.string().optional(),
      streetType: z.string().optional(),
      streetName: z.string().optional(),
      suburb: z.string().optional(),
      state: state.optional(),
      postcode: z.string().optional(),
    }),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    lga: z.strictObject({ code: z.string(), name: z.string() }).optional(),
  }),
  council: Council,
  timezone: z.string(),
  today: date,
  range: z.strictObject({ from: date, to: date }),
  services: z.array(
    z.strictObject({
      type: binType,
      name: z.string(),
      colour: z.string().optional(),
      frequency: z.string().meta({
        description: '`weekly`, `fortnightly`, `every N days` or `irregular`.',
      }),
      everyDays: z.number().optional(),
      next: date.optional(),
      optional: z.boolean().optional().meta({ description: 'Opt-in service, e.g. green bins.' }),
      notes: z.string().optional(),
    }),
  ),
  days: z.array(Day).meta({ description: 'Only days with a collection, in date order.' }),
  next: Day.nullable().meta({
    description: 'The next collection day on or after today (may be outside `range`).',
  }),
  source: z.string().optional(),
});

export const CouncilsResponse = z.strictObject({ councils: z.array(Council) });

export const CoverageResponse = z.strictObject({
  type: z.literal('FeatureCollection'),
  features: z.array(
    z.strictObject({
      type: z.literal('Feature'),
      properties: z.strictObject({
        council: z.string().meta({ examples: ['qld/brisbane'] }),
        name: z.string(),
        state,
      }),
      geometry: z.looseObject({ type: z.string() }).meta({
        description: 'A GeoJSON Polygon or MultiPolygon (longitude, latitude), simplified.',
      }),
    }),
  ),
});

export const ErrorResponse = z.strictObject({
  error: z.looseObject({
    code: z.enum([
      'INVALID_INPUT',
      'ADDRESS_NOT_FOUND',
      'COUNCIL_NOT_SUPPORTED',
      'UPSTREAM_ERROR',
      'PARSE_ERROR',
      'INTERNAL',
    ]),
    message: z.string(),
    suggestions: z.array(z.string()).optional().meta({
      description: 'On ADDRESS_NOT_FOUND: near-miss addresses the council does know.',
    }),
  }),
});

type JsonSchema = Record<string, unknown>;

function schema(type: z.ZodType): JsonSchema {
  const { $schema: _, ...rest } = z.toJSONSchema(type, { io: 'input' });
  return rest;
}

function parameters(query: z.ZodObject) {
  const { properties = {}, required = [] } = schema(query) as {
    properties?: Record<string, JsonSchema>;
    required?: string[];
  };
  return Object.entries(properties).map(([name, { description, ...rest }]) => ({
    name,
    in: 'query',
    required: required.includes(name),
    ...(description ? { description } : {}),
    schema: rest,
  }));
}

const json = (description: string, type: z.ZodType) => ({
  description,
  content: { 'application/json': { schema: schema(type) } },
});

export function openApiDocument() {
  return {
    openapi: '3.1.0',
    info: {
      title: 'bin-days',
      version: '1',
      description:
        'Australian bin collection days. Give it an address and a date range; get back which bins go out when, in the same shape for every council.',
    },
    paths: {
      '/v1/collections': {
        get: {
          summary: 'Bin collection days for an address',
          parameters: parameters(CollectionsQuery),
          responses: {
            200: json('The schedule for the matched property.', CollectionsResponse),
            400: json('Bad params.', ErrorResponse),
            404: json('Could not locate the address.', ErrorResponse),
            422: json("The address is valid but its council isn't supported yet.", ErrorResponse),
            502: json('The council site is down or has changed.', ErrorResponse),
          },
        },
      },
      '/v1/calendar.ics': {
        get: {
          summary: 'Calendar feed of bin days for an address',
          description:
            'An iCalendar feed of the next year of collection days, one all-day event per day. Subscribe to its address in a calendar app (use `webcal://` in place of `https://`) and the app keeps it up to date.',
          parameters: parameters(CalendarQuery),
          responses: {
            200: {
              description: 'The calendar.',
              content: { 'text/calendar': { schema: { type: 'string' } } },
            },
            400: json('Bad params.', ErrorResponse),
            404: json('Could not locate the address.', ErrorResponse),
            422: json("The address is valid but its council isn't supported yet.", ErrorResponse),
            502: json('The council site is down or has changed.', ErrorResponse),
          },
        },
      },
      '/v1/councils': {
        get: {
          summary: 'Supported councils',
          parameters: parameters(CouncilsQuery),
          responses: { 200: json('The supported councils.', CouncilsResponse) },
        },
      },
      '/v1/coverage': {
        get: {
          summary: 'Map of supported areas',
          description: 'A GeoJSON FeatureCollection with one feature per council area.',
          responses: {
            200: json('The areas the supported councils cover.', CoverageResponse),
            502: json('The boundary service is down.', ErrorResponse),
          },
        },
      },
    },
  };
}

// shortcut: Swagger UI loads from a CDN, so /docs needs internet; vendor swagger-ui-dist if that matters.
export const DOCS_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>bin-days API</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui.css" />
  </head>
  <body>
    <div id="docs"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-bundle.js"></script>
    <script>SwaggerUIBundle({ url: '/openapi.json', dom_id: '#docs' });</script>
  </body>
</html>`;
