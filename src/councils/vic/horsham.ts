import { createWasteInfoCouncil } from '../../platforms/waste-info.js';

/** Horsham Rural City Council, on waste-info.com.au. */
export const horsham = createWasteInfoCouncil({
  id: 'vic/horsham',
  name: 'Horsham Rural City Council',
  state: 'VIC',
  lgaCodes: ['23190'],
  timezone: 'Australia/Melbourne',
  subdomain: 'hrcc',
});
