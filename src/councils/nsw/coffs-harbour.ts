import { createWasteInfoCouncil } from '../../platforms/waste-info.js';

/** City of Coffs Harbour, on waste-info.com.au. */
export const coffsHarbour = createWasteInfoCouncil({
  id: 'nsw/coffs-harbour',
  name: 'City of Coffs Harbour',
  state: 'NSW',
  lgaCodes: ['11800'],
  timezone: 'Australia/Sydney',
  subdomain: 'coffs-coast',
});
