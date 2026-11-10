import { createWasteInfoCouncil } from '../../platforms/waste-info.js';

/** Lithgow City Council, on waste-info.com.au. */
export const lithgow = createWasteInfoCouncil({
  id: 'nsw/lithgow',
  name: 'Lithgow City Council',
  state: 'NSW',
  lgaCodes: ['14870'],
  timezone: 'Australia/Sydney',
  subdomain: 'lithgow',
});
