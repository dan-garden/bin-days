import { createWasteInfoCouncil } from '../../platforms/waste-info.js';

/** Cowra Shire Council, on waste-info.com.au. */
export const cowra = createWasteInfoCouncil({
  id: 'nsw/cowra',
  name: 'Cowra Shire Council',
  state: 'NSW',
  lgaCodes: ['12350'],
  timezone: 'Australia/Sydney',
  subdomain: 'cowra',
});
