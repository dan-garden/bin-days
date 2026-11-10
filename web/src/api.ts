import type { PageData } from '../../src/api/site.js';
import type { CouncilInfo } from '../../src/councils/types.js';
import type { BinDaysResult, CollectionDay, Coverage, ServiceSummary } from '../../src/service.js';

/** The API's own types, so the UI can't drift from the response contract. */
export type { BinDaysResult, CollectionDay, CouncilInfo, Coverage, ServiceSummary };
export type Bin = CollectionDay['bins'][number];

export class ApiError extends Error {
  constructor(
    message: string,
    /** The API's error code, e.g. `ADDRESS_NOT_FOUND`. */
    readonly code: string,
    /** Near-miss addresses the council does know. */
    readonly suggestions: string[] = [],
  ) {
    super(message);
  }
}

async function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, signal ? { signal } : {});
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new ApiError(
      "Couldn't reach the server. Check your connection and try again.",
      'OFFLINE',
    );
  }
  const body = await response.json().catch(() => undefined);
  if (!response.ok) {
    const { message = 'Something went wrong', code = 'INTERNAL', suggestions } = body?.error ?? {};
    throw new ApiError(message, code, Array.isArray(suggestions) ? suggestions : []);
  }
  return body as T;
}

export const getCollections = (address: string, signal?: AbortSignal) =>
  get<BinDaysResult>(`/v1/collections?address=${encodeURIComponent(address)}`, signal);

export const getCouncils = () =>
  get<{ councils: CouncilInfo[] }>('/v1/councils').then((body) => body.councils);

export const getCoverage = () => get<Coverage>('/v1/coverage');

/** What the server said about the page it served, e.g. which council's landing page this is. */
export function pageData(): PageData {
  try {
    return JSON.parse(document.getElementById('page-data')?.textContent ?? '{}');
  } catch {
    return {};
  }
}
