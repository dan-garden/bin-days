import { createWasteInfoCouncil } from '../../platforms/waste-info.js';

/** Ku-ring-gai Council, on waste-info.com.au. */
export const kuRingGai = createWasteInfoCouncil({
  id: 'nsw/ku-ring-gai',
  name: 'Ku-ring-gai Council',
  state: 'NSW',
  lgaCodes: ['14500'],
  timezone: 'Australia/Sydney',
  subdomain: 'ku-ring-gai',
});
