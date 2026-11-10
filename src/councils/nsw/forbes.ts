import { createWasteInfoCouncil } from '../../platforms/waste-info.js';

/** Forbes Shire Council, on waste-info.com.au. */
export const forbes = createWasteInfoCouncil({
  id: 'nsw/forbes',
  name: 'Forbes Shire Council',
  state: 'NSW',
  lgaCodes: ['12900'],
  timezone: 'Australia/Sydney',
  subdomain: 'forbes',
});
