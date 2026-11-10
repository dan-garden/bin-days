import { createWasteInfoCouncil } from '../../platforms/waste-info.js';

/** Inner West Council, on waste-info.com.au. */
export const innerWest = createWasteInfoCouncil({
  id: 'nsw/inner-west',
  name: 'Inner West Council',
  state: 'NSW',
  lgaCodes: ['14170'],
  timezone: 'Australia/Sydney',
  subdomain: 'leichhardt',
});
