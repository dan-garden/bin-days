import { createWasteInfoCouncil } from '../../platforms/waste-info.js';

/** Snowy Valleys Council, on waste-info.com.au. */
export const snowyValleys = createWasteInfoCouncil({
  id: 'nsw/snowy-valleys',
  name: 'Snowy Valleys Council',
  state: 'NSW',
  lgaCodes: ['17080'],
  timezone: 'Australia/Sydney',
  subdomain: 'snowy-valleys',
});
