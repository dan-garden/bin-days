import { createWasteInfoCouncil } from '../../platforms/waste-info.js';

/** Clarence Valley Council, on waste-info.com.au. */
export const clarenceValley = createWasteInfoCouncil({
  id: 'nsw/clarence-valley',
  name: 'Clarence Valley Council',
  state: 'NSW',
  lgaCodes: ['11730'],
  timezone: 'Australia/Sydney',
  subdomain: 'clarence',
});
