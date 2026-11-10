import { createWasteInfoCouncil } from '../../platforms/waste-info.js';

/** Redland City Council, on waste-info.com.au. */
export const redland = createWasteInfoCouncil({
  id: 'qld/redland',
  name: 'Redland City Council',
  state: 'QLD',
  lgaCodes: ['36250'],
  timezone: 'Australia/Brisbane',
  website: 'https://redland.qld.gov.au/BinCollection',
  subdomain: 'redland',
});
