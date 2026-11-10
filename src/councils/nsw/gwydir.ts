import { createWasteInfoCouncil } from '../../platforms/waste-info.js';

/** Gwydir Shire Council, on waste-info.com.au. */
export const gwydir = createWasteInfoCouncil({
  id: 'nsw/gwydir',
  name: 'Gwydir Shire Council',
  state: 'NSW',
  lgaCodes: ['13660'],
  timezone: 'Australia/Sydney',
  subdomain: 'gwydir',
});
