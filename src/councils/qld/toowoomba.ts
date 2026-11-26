import { pickAddress, searchLine } from '../../core/address.js';
import { addDays, parseAustralianDate } from '../../core/date.js';
import { addressNotFound, parseError } from '../../core/errors.js';
import { getJson, type HttpClient } from '../../core/http.js';
import { binService } from '../../core/schedule.js';
import type { BinService } from '../../core/types.js';
import type { CouncilAdapter } from '../types.js';

/**
 * Toowoomba Regional Council, via its "find your bin day" form. The council's address search
 * finds the property; the form (a Boomi Flow) then has to be stepped through as a visitor would:
 * start it, open its page, and submit the address. It answers with this week's collection day and
 * which bins go that week ("General & Recycle"), which fixes the recycling fortnight.
 */
const ADDRESSES = 'https://apigateway.tr.qld.gov.au/ws/rest/v1/Property';
const FLOW = 'https://au.flow-prod.boomi.com/api/run/1';
const TENANT = '8c3baeb7-fb90-479f-83c8-ce79bb5efa56';
const FLOW_ID = '6f11c501-9c9c-49cf-b35c-3aff7fe7f08e';
const PLAYER = `https://au.flow-prod.boomi.com/${TENANT}/play/TRC-Forms-Prod/`;

interface FlowState {
  stateId: string;
  stateToken: string;
  currentMapElementId: string;
  mapElementInvokeResponses?: Array<{
    outcomeResponses?: Array<{ id: string; developerName?: string }>;
    pageResponse?: {
      pageComponentResponses?: Array<{
        id: string;
        developerName?: string;
        componentType?: string;
      }>;
      pageComponentDataResponses?: Array<{ pageComponentId: string; content?: string | null }>;
    };
  }>;
}

const post = (http: HttpClient, url: string, body: object) =>
  getJson<FlowState>(http, url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ManyWhoTenant: TENANT },
    body: JSON.stringify(body),
  });

/** Move the form on a step, from the state the last step left it in. */
const step = (http: HttpClient, state: FlowState, invoke: object) =>
  post(http, `${FLOW}/state/${state.stateId}`, {
    stateId: state.stateId,
    stateToken: state.stateToken,
    currentMapElementId: state.currentMapElementId,
    invokeType: 'FORWARD',
    mapElementInvokeRequest: invoke,
  });

const pageOf = (state: FlowState) => state.mapElementInvokeResponses?.[0];

/** A part of the form's page, by the name the form gives it. */
function content(state: FlowState, name: string): string {
  const page = pageOf(state)?.pageResponse;
  const id = page?.pageComponentResponses?.find((c) => c.developerName === name)?.id;
  const html = page?.pageComponentDataResponses?.find((d) => d.pageComponentId === id)?.content;
  return (html ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** This week's collection date and its bins, from the form's answer. Exported for tests. */
export function parseAnswer(text: string): BinService[] {
  // "This weeks collection: General & Recycle This weeks collection date: Monday 09/11/2026"
  const [, bins = ''] =
    /This weeks collection:\s*(.*?)\s*This weeks collection date/i.exec(text) ?? [];
  const date = parseAustralianDate(
    /collection date:\s*\S+\s+(\d{1,2}\/\d{1,2}\/\d{4})/i.exec(text)?.[1] ?? '',
  );
  if (!date) return [];
  const services = [
    binService('general', 'General waste', date, 7),
    binService('recycling', 'Recycling', /recycl/i.test(bins) ? date : addDays(date, 7), 14),
  ];
  // Green waste bins are optional, so only one named this week is shown.
  if (/green/i.test(bins)) {
    services.push({
      ...binService('organics', 'Green waste', date, 14),
      optional: true,
      notes: 'For homes with a green waste bin.',
    });
  }
  return services;
}

export const toowoomba: CouncilAdapter = {
  id: 'qld/toowoomba',
  name: 'Toowoomba Regional Council',
  state: 'QLD',
  lgaCodes: ['36910'],
  timezone: 'Australia/Brisbane',
  website: 'https://www.tr.qld.gov.au',
  platform: 'council-api',
  async getSchedule(address, { http }) {
    const search = `${ADDRESSES}?${new URLSearchParams({ address: searchLine(address, this.name, { includeUnit: true }) })}`;
    const results = await getJson<Array<{ Formatted_Address: string }>>(http, search);
    // "12 Example Street TOOWOOMBA CITY QLD 4350", sometimes listed twice.
    const lines = [
      ...new Set((Array.isArray(results) ? results : []).map((r) => r.Formatted_Address)),
    ];
    const property = pickAddress(lines, (line) => line, address, this.name);

    const started = await post(http, FLOW, {
      flowId: { id: FLOW_ID, versionId: null },
      playerUrl: PLAYER,
      joinPlayerUrl: PLAYER,
    });
    const opened = await step(http, started, { selectedOutcomeId: null });
    const outcome = pageOf(opened)?.outcomeResponses?.find((o) => o.developerName === 'Search');
    const field = pageOf(opened)?.pageResponse?.pageComponentResponses?.find(
      (c) => c.componentType === 'addresssearch',
    );
    if (!outcome || !field) throw parseError("Toowoomba's bin day form has changed", { url: FLOW });
    const answer = await step(http, opened, {
      selectedOutcomeId: outcome.id,
      pageRequest: {
        pageComponentInputResponses: [
          { pageComponentId: field.id, contentValue: property, objectData: null },
        ],
      },
    });
    const services = parseAnswer(content(answer, 'Bin information'));
    if (!services.length) {
      // The form says "Sorry, an unexpected error occurred" for a property it has no service for.
      throw content(answer, 'Error container')
        ? addressNotFound(`${this.name} has no bin collection for "${property}"`)
        : parseError(`No bin services found for ${property}`, { url: FLOW });
    }
    return { matchedAddress: property, services, sourceUrl: 'https://www.tr.qld.gov.au' };
  },
};
