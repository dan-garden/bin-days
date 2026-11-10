import { createWasteInfoCouncil } from '../../platforms/waste-info.js';

/** Burwood Council, on waste-info.com.au. */
export const burwood = createWasteInfoCouncil({
  id: 'nsw/burwood',
  name: 'Burwood Council',
  state: 'NSW',
  lgaCodes: ['11300'],
  timezone: 'Australia/Sydney',
  subdomain: 'burwood',
});
