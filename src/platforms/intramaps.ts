import { formatStreetLine, matchesHouseNumber } from '../core/address.js';
import { addDays, nextWeekday, parseAustralianDate, weekdayInWeekOf } from '../core/date.js';
import { addressNotFound, parseError, upstreamError } from '../core/errors.js';
import type { HttpClient } from '../core/http.js';
import { binService } from '../core/schedule.js';
import type { BinService, BinType, LocalDate } from '../core/types.js';
import type { CouncilAdapter, CouncilInfo } from '../councils/types.js';

/**
 * Adapter for councils that publish bin days through IntraMaps, TechnologyOne's
 * mapping system. A lookup is one short session of four requests:
 *
 *   POST {app}/ApplicationEngine/Projects/           -> an `X-IntraMaps-Session` header
 *   POST {app}/ApplicationEngine/Modules/            -> the address search form's id
 *   POST {app}/ApplicationEngine/Search/             -> properties matching the address
 *   POST {app}/ApplicationEngine/Search/Refine/Set   -> the chosen property's panel of fields
 *
 * Every council names and formats its bin fields differently ("Next Recycling
 * Collection: 16/11/2026", "Refuse Day: Monday"), so each council's config says
 * which fields are bins. `readIntraMapsPanel` shows what a council's panel holds.
 */
export interface IntraMapsBin {
  /** The panel field holding this bin's next date or weekday. */
  field: string;
  type: BinType;
  /** What to call the bin. */
  name: string;
  /** The collection cycle in days, where the council's panel doesn't give more than one date. */
  everyDays?: number;
}

export interface IntraMapsConfig extends Omit<CouncilInfo, 'platform'> {
  /** e.g. `https://swan.spatial.t1cloud.com` */
  baseUrl: string;
  /** Where the app lives on that host, e.g. `spatial/intramaps` or `IntraMaps23A`. */
  instance: string;
  project: string;
  configId?: string;
  liteConfigId?: string;
  /** The map module holding the address search. Defaults to the project's first. */
  moduleId?: string;
  selectionLayerFilter?: string;
  bins: IntraMapsBin[];
}

type Connection = Pick<
  IntraMapsConfig,
  | 'baseUrl'
  | 'instance'
  | 'project'
  | 'configId'
  | 'liteConfigId'
  | 'moduleId'
  | 'selectionLayerFilter'
>;

const NO_ID = '00000000-0000-0000-0000-000000000000';

/** Read a value whatever its key's capitalisation; IntraMaps versions differ. */
function pick(object: Record<string, unknown>, key: string): string | undefined {
  const found = Object.entries(object).find(([k]) => k.toLowerCase() === key.toLowerCase())?.[1];
  return found == null ? undefined : String(found);
}

/**
 * Find a property and return its panel: the address as the council shows it,
 * and every field as `name -> text`. Exported so a new council's field names
 * can be discovered.
 */
export async function readIntraMapsPanel(
  http: HttpClient,
  connection: Connection,
  search: string,
  isMatch: (displayValue: string) => boolean = () => true,
): Promise<{ address: string; fields: Record<string, string>; candidates: string[] } | undefined> {
  const app = `${connection.baseUrl.replace(/\/$/, '')}/${connection.instance}/ApplicationEngine`;
  const post = async (path: string, query: Record<string, string>, body?: unknown) => {
    const url = `${app}${path}?${new URLSearchParams(query)}`;
    const response = await http.fetch(url, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'x-requested-with': 'XMLHttpRequest',
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    if (!response.ok) {
      throw upstreamError(`${new URL(url).host} responded with HTTP ${response.status}`, { url });
    }
    return response;
  };
  const json = async (response: Response) =>
    (await response.json().catch(() => ({}))) as Record<string, unknown>;

  const opened = await post('/Projects/', {
    configId: connection.configId ?? NO_ID,
    appType: 'MapBuilder',
    project: connection.project,
    datasetCode: '',
    includeDisabledModules: 'true',
    ...(connection.liteConfigId ? { liteConfigId: connection.liteConfigId } : {}),
  });
  const session = opened.headers.get('x-intramaps-session')?.trim();
  if (!session) throw parseError('IntraMaps did not start a session', { url: app });
  const project = await json(opened);
  const modules = (project.moduleList ?? project.modules ?? []) as Array<{ id?: string }>;
  const module = connection.moduleId ?? modules[0]?.id;
  if (!module) throw parseError('IntraMaps project has no map module', { url: app });

  const setup = await json(
    await post(
      '/Modules/',
      { IntraMapsSession: session },
      {
        module,
        includeWktInSelection: true,
        includeBasemaps: false,
      },
    ),
  );
  const forms = (setup.forms ?? []) as Array<Record<string, string>>;
  const fullText = forms.filter((form) => form.subType?.toLowerCase() === 'fulltext');
  const form = fullText.find((f) => f.name?.toLowerCase() === 'address') ?? fullText[0];
  if (!form?.templateId) throw parseError('IntraMaps has no address search form', { url: app });

  const found = await json(
    await post(
      '/Search/',
      {
        infoPanelWidth: '0',
        mode: 'Refresh',
        form: form.templateId,
        resubmit: 'false',
        IntraMapsSession: session,
        ...(connection.selectionLayerFilter
          ? { selectionLayersFilter: connection.selectionLayerFilter }
          : {}),
      },
      { fields: [search] },
    ),
  );
  const results = (found.fullText ?? []) as Array<Record<string, unknown>>;
  const candidates = results.map((result) => pick(result, 'displayValue') ?? '');
  const chosen = results.find((result) => isMatch(pick(result, 'displayValue') ?? ''));
  const dbKey = chosen && pick(chosen, 'dbKey');
  if (!chosen || !dbKey) return undefined;

  const selected = await json(
    await post(
      '/Search/Refine/Set',
      { IntraMapsSession: session },
      {
        selectionLayer: pick(chosen, 'selectionLayer') ?? pick(chosen, 'selectionLayerId') ?? '',
        mapKey: pick(chosen, 'mapKey') ?? '',
        infoPanelWidth: -350,
        mode: 'Refresh',
        dbKey,
        zoomType: 'current',
      },
    ),
  );
  const panels = (selected.infoPanels ?? {}) as Record<
    string,
    { feature?: { fields?: unknown[] } } | null
  >;
  const fields: Record<string, string> = {};
  for (const panel of Object.values(panels)) {
    for (const field of (panel?.feature?.fields ?? []) as Array<Record<string, unknown>>) {
      const name = String(field.name ?? field.caption ?? '');
      const value = field.value;
      const text =
        typeof value === 'object' && value !== null ? (value as { value?: unknown }).value : value;
      if (name && typeof text === 'string') fields[name] ??= stripTags(text);
    }
  }
  return { address: pick(chosen, 'displayValue') ?? search, fields, candidates };
}

const stripTags = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const WEEKDAY = /(Mon|Tues|Wednes|Thurs|Fri|Satur|Sun)day/i;

/**
 * The next collection a panel field describes. Councils write these many ways:
 * "Friday, 13 November 2026", "Fortnightly on Thursday, Next: 19 Nov 2026",
 * "Every Monday", "Friday This Week". A bare weekday only pins a date down for
 * a weekly bin. Exported for tests.
 */
export function parsePanelDate(
  text: string,
  today: LocalDate,
  everyDays?: number,
): LocalDate | undefined {
  const dated =
    /\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]{3,9}\s+\d{4}|\d{4}-\d{2}-\d{2}/.exec(
      text,
    )?.[0];
  if (dated) return parseAustralianDate(dated.replace(/(\d)(st|nd|rd|th)/, '$1')) ?? undefined;

  const day = WEEKDAY.exec(text)?.[0];
  if (!day) return undefined;
  const relative = /(this|next)\s+week/i.exec(text)?.[1]?.toLowerCase();
  if (relative) {
    return weekdayInWeekOf(day, relative === 'next' ? addDays(today, 7) : today);
  }
  return everyDays === 7 ? nextWeekday(day, today) : undefined;
}

/** The cycle a field spells out, if it does. ("Week B" or "This Week" say nothing about it.) */
function statedCycle(text: string): number | undefined {
  if (/fortnight/i.test(text)) return 14;
  if (/\bweekly\b|\bevery\b/i.test(text)) return 7;
  return undefined;
}

export function createIntraMapsCouncil(config: IntraMapsConfig): CouncilAdapter {
  const {
    baseUrl,
    instance: _instance,
    project: _project,
    configId: _configId,
    liteConfigId: _liteConfigId,
    moduleId: _moduleId,
    selectionLayerFilter: _filter,
    bins,
    ...info
  } = config;

  return {
    ...info,
    platform: 'intramaps',
    async getSchedule(address, { http, today }) {
      const { parts } = address;
      // Some councils index "Estuary Road" and others "Estuary RD", and some find nothing once a
      // suburb is added, so try each spelling with the suburb and then without.
      const lines = [false, true].map((abbreviate) =>
        formatStreetLine(parts, { includeUnit: true, abbreviate }),
      );
      const suburb = parts.suburb ?? '';
      const searches = new Set([...lines.map((line) => `${line} ${suburb}`.trim()), ...lines]);
      let panel: Awaited<ReturnType<typeof readIntraMapsPanel>>;
      for (const search of searches) {
        panel = await readIntraMapsPanel(
          http,
          config,
          search,
          (shown) =>
            matchesHouseNumber(shown, parts) && shown.toUpperCase().includes(suburb.toUpperCase()),
        );
        if (panel) break;
      }
      if (!panel) {
        throw addressNotFound(`${info.name} could not find "${address.input}"`);
      }

      const services: BinService[] = [];
      for (const bin of bins) {
        const text = panel.fields[bin.field] ?? '';
        // What the council says about the cycle ("Collected fortnightly ...") beats our setting.
        const everyDays = statedCycle(text) ?? bin.everyDays;
        const next = parsePanelDate(text, today, everyDays);
        if (!next) continue;
        services.push(binService(bin.type, bin.name, next, everyDays));
      }
      if (!services.length) {
        throw parseError(`No bin services found for ${panel.address}`, {
          fields: Object.keys(panel.fields),
        });
      }
      return { matchedAddress: panel.address, services, sourceUrl: baseUrl };
    },
  };
}
