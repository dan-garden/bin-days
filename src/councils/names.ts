import type { AustralianState } from '../core/types.js';

/** Display names shared by the API's pages and the web UI. No dependencies, so the UI can bundle it. */

export const STATE_NAMES: Record<AustralianState, string> = {
  ACT: 'Australian Capital Territory',
  NSW: 'New South Wales',
  NT: 'Northern Territory',
  QLD: 'Queensland',
  SA: 'South Australia',
  TAS: 'Tasmania',
  VIC: 'Victoria',
  WA: 'Western Australia',
};

/**
 * The place a council is named after: "Brisbane City Council", "City of
 * Ballarat" and "Canberra (ACT Government)" become "Brisbane", "Ballarat" and
 * "Canberra".
 */
export function shortCouncilName(name: string): string {
  return name
    .replace(/ \(.*\)$/, '')
    .replace(
      /^(The )?(Rural )?(City|Town|Shire|Municipality|District Council|Regional Council) of /,
      '',
    )
    .replace(/ ((Rural )?City|Regional|District|Shire|Municipal|Town|Borough)? ?Council$/, '');
}

/** Where a council's dates come from, to finish the sentence "The dates come from ...". */
export function sourceDescription(council: {
  name: string;
  platform?: string | undefined;
}): string {
  switch (council.platform) {
    case 'my-local-services':
      return `${council.name}'s collection zones in My Local Services, the South Australian Government's council services app`;
    case 'waste-info':
      return `${council.name}'s online collection calendar`;
    case 'opencities':
      return `${council.name}'s own website`;
    default:
      return `open data published for ${council.name}`;
  }
}

/** A state's page on the website, e.g. `/bin-day/qld`. */
export const statePath = (state: string) => `/bin-day/${state.toLowerCase()}`;

/** A council's landing page on the website, e.g. `/bin-day/qld/brisbane`. */
export const councilPath = (council: { id: string }) => `/bin-day/${council.id}`;
