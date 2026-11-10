import { z } from 'zod';
import { parseError } from '../core/errors.js';
import { getJson, type HttpClient } from '../core/http.js';

/**
 * Helpers for Opendatasoft (Explore API v2.1) portals. Several councils and
 * state governments publish waste data on Opendatasoft, e.g.
 * data.brisbane.qld.gov.au.
 */
export interface OdsQuery {
  /** Portal origin, e.g. `https://data.brisbane.qld.gov.au` */
  portal: string;
  dataset: string;
  /** ODSQL where clause. Build string literals with `odsString`. */
  where?: string;
  select?: string[];
  orderBy?: string;
  limit?: number;
}

const OdsRecords = z.object({
  total_count: z.number(),
  results: z.array(z.record(z.string(), z.unknown())),
});

export async function queryOpendatasoft<T extends Record<string, unknown>>(
  http: HttpClient,
  query: OdsQuery,
): Promise<{ total: number; records: T[]; url: string }> {
  const url = new URL(
    `/api/explore/v2.1/catalog/datasets/${encodeURIComponent(query.dataset)}/records`,
    query.portal,
  );
  if (query.where) url.searchParams.set('where', query.where);
  if (query.select?.length) url.searchParams.set('select', query.select.join(','));
  if (query.orderBy) url.searchParams.set('order_by', query.orderBy);
  url.searchParams.set('limit', String(Math.min(query.limit ?? 20, 100)));

  const parsed = OdsRecords.safeParse(await getJson(http, url));
  if (!parsed.success) {
    throw parseError(`Unexpected response from ${url.host}`, { dataset: query.dataset });
  }
  return { total: parsed.data.total_count, records: parsed.data.results as T[], url: String(url) };
}

/** Quote a value as an ODSQL string literal. */
export function odsString(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}
