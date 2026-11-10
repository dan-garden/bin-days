import { createWasteInfoCouncil } from '../../platforms/waste-info.js';

/** City of Ballarat, on waste-info.com.au. */
export const ballarat = createWasteInfoCouncil({
  id: 'vic/ballarat',
  name: 'City of Ballarat',
  state: 'VIC',
  lgaCodes: ['20570'],
  timezone: 'Australia/Melbourne',
  subdomain: 'ballarat',
});
