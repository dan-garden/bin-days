import { createWasteInfoCouncil } from '../../platforms/waste-info.js';

/** Cumberland City Council, on waste-info.com.au. */
export const cumberland = createWasteInfoCouncil({
  id: 'nsw/cumberland',
  name: 'Cumberland City Council',
  state: 'NSW',
  lgaCodes: ['12380'],
  timezone: 'Australia/Sydney',
  website: 'https://www.cumberland.nsw.gov.au/find-your-bin-day',
  subdomain: 'cumberland',
});
