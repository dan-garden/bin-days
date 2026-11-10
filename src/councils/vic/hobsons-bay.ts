import { createWasteInfoCouncil } from '../../platforms/waste-info.js';

/** Hobsons Bay City Council, on waste-info.com.au. */
export const hobsonsBay = createWasteInfoCouncil({
  id: 'vic/hobsons-bay',
  name: 'Hobsons Bay City Council',
  state: 'VIC',
  lgaCodes: ['23110'],
  timezone: 'Australia/Melbourne',
  subdomain: 'hobsons-bay',
});
