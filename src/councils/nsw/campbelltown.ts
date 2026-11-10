import { createWasteInfoCouncil } from '../../platforms/waste-info.js';

/** Campbelltown City Council, on waste-info.com.au. */
export const campbelltown = createWasteInfoCouncil({
  id: 'nsw/campbelltown',
  name: 'Campbelltown City Council',
  state: 'NSW',
  lgaCodes: ['11500'],
  timezone: 'Australia/Sydney',
  subdomain: 'campbelltown',
});
