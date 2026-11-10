import { createWasteInfoCouncil } from '../../platforms/waste-info.js';

/** Moree Plains Shire Council, on waste-info.com.au. */
export const moreePlains = createWasteInfoCouncil({
  id: 'nsw/moree-plains',
  name: 'Moree Plains Shire Council',
  state: 'NSW',
  lgaCodes: ['15300'],
  timezone: 'Australia/Sydney',
  subdomain: 'moree',
});
