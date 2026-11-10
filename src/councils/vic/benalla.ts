import { createWasteInfoCouncil } from '../../platforms/waste-info.js';

/** Benalla Rural City Council, on waste-info.com.au. */
export const benalla = createWasteInfoCouncil({
  id: 'vic/benalla',
  name: 'Benalla Rural City Council',
  state: 'VIC',
  lgaCodes: ['21010'],
  timezone: 'Australia/Melbourne',
  subdomain: 'benalla',
});
