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

/** The place a council is named after: "Brisbane City Council" and "City of Ballarat" become "Brisbane" and "Ballarat". */
export function shortCouncilName(name: string): string {
  return name.replace(/^City of /, '').replace(/ (Rural City|Regional|City|Shire)? ?Council$/, '');
}

/** A council's landing page on the website, e.g. `/bin-day/qld/brisbane`. */
export const councilPath = (council: { id: string }) => `/bin-day/${council.id}`;
