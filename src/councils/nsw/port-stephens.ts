import { createWasteInfoCouncil } from '../../platforms/waste-info.js';

/** Port Stephens Council, on waste-info.com.au. */
export const portStephens = createWasteInfoCouncil({
  id: 'nsw/port-stephens',
  name: 'Port Stephens Council',
  state: 'NSW',
  lgaCodes: ['16400'],
  timezone: 'Australia/Sydney',
  subdomain: 'port-stephens',
});
