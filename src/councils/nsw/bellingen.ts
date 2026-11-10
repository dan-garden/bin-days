import { createWasteInfoCouncil } from '../../platforms/waste-info.js';

/** Bellingen Shire Council, on waste-info.com.au. */
export const bellingen = createWasteInfoCouncil({
  id: 'nsw/bellingen',
  name: 'Bellingen Shire Council',
  state: 'NSW',
  lgaCodes: ['10600'],
  timezone: 'Australia/Sydney',
  subdomain: 'coffs-coast',
});
