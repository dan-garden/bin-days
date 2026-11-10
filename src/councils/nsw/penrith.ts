import { createWasteInfoCouncil } from '../../platforms/waste-info.js';

/** Penrith City Council, on waste-info.com.au. */
export const penrith = createWasteInfoCouncil({
  id: 'nsw/penrith',
  name: 'Penrith City Council',
  state: 'NSW',
  lgaCodes: ['16350'],
  timezone: 'Australia/Sydney',
  website: 'https://www.penrithcity.nsw.gov.au/waste-environment/waste/waste-collection-schedules',
  subdomain: 'penrith',
});
