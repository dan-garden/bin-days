import { createWasteInfoCouncil } from '../../platforms/waste-info.js';

/** Bayside Council, on waste-info.com.au. */
export const bayside = createWasteInfoCouncil({
  id: 'nsw/bayside',
  name: 'Bayside Council',
  state: 'NSW',
  lgaCodes: ['10500'],
  timezone: 'Australia/Sydney',
  subdomain: 'rockdale',
});
