import { createWasteInfoCouncil } from '../../platforms/waste-info.js';

/** Blue Mountains City Council, on waste-info.com.au. */
export const blueMountains = createWasteInfoCouncil({
  id: 'nsw/blue-mountains',
  name: 'Blue Mountains City Council',
  state: 'NSW',
  lgaCodes: ['10900'],
  timezone: 'Australia/Sydney',
  subdomain: 'bmcc',
});
