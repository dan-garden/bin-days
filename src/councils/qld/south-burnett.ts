import { createWasteInfoCouncil } from '../../platforms/waste-info.js';

/** South Burnett Regional Council, on waste-info.com.au. */
export const southBurnett = createWasteInfoCouncil({
  id: 'qld/south-burnett',
  name: 'South Burnett Regional Council',
  state: 'QLD',
  lgaCodes: ['36630'],
  timezone: 'Australia/Brisbane',
  subdomain: 'south-burnett',
});
