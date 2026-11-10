import { createWasteInfoCouncil } from '../../platforms/waste-info.js';

/** Gympie Regional Council, on waste-info.com.au. */
export const gympie = createWasteInfoCouncil({
  id: 'qld/gympie',
  name: 'Gympie Regional Council',
  state: 'QLD',
  lgaCodes: ['33620'],
  timezone: 'Australia/Brisbane',
  subdomain: 'gympie',
});
