import { parseError } from '../core/errors.js';
import { getJson, type HttpClient } from '../core/http.js';

/**
 * Helpers for councils whose bin day map is a Pozi site (`<site>.pozi.com`)
 * backed by a map server rather than a zone file (for those, see `zone-file.ts`).
 * The map lists its datasets, one of which is the server to ask:
 *
 *   GET https://<site>.pozi.com/api/v1/public/maps/<map>/datasets
 *     -> { mapdatasets: [{ datasets: [{ title: "... QGIS Project", url }] }] }
 *   GET <url>?SERVICE=WFS&REQUEST=GetFeature&TYPENAME=<layer>&...
 *     -> GeoJSON features
 */
interface Datasets {
  mapdatasets?: Array<{ datasets?: Array<{ title: string; url: string }> }>;
}

/** The fields of a layer's features that match the given WFS filter (`BBOX`, `EXP_FILTER`). */
export async function queryPoziLayer(
  http: HttpClient,
  site: string,
  map: string,
  layer: string,
  filter: Record<string, string>,
): Promise<{ features: Array<Record<string, unknown>>; url: string }> {
  const listUrl = `https://${site}.pozi.com/api/v1/public/maps/${map}/datasets`;
  // The server's address changes when the council republishes its map, so it is looked up.
  const list = await getJson<Datasets>(http, listUrl, { headers: { 'X-Pozi-Sitename': site } });
  const server = list.mapdatasets
    ?.flatMap((group) => group.datasets ?? [])
    .find((dataset) => dataset.title.includes('QGIS Project'));
  if (!server)
    throw parseError(`${site}.pozi.com no longer lists its map server`, { url: listUrl });

  const url = `${server.url}?${new URLSearchParams({
    SERVICE: 'WFS',
    VERSION: '1.1.0',
    REQUEST: 'GetFeature',
    TYPENAME: layer,
    OUTPUTFORMAT: 'application/json',
    SRSNAME: 'EPSG:4326',
    MAXFEATURES: '10',
    ...filter,
  })}`;
  const found = await getJson<{ features?: Array<{ properties: Record<string, unknown> }> }>(
    http,
    url,
  );
  return { features: (found.features ?? []).map((feature) => feature.properties), url };
}
