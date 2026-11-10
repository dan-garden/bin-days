import { createWasteInfoCouncil } from '../../platforms/waste-info.js';

/** Bega Valley Shire Council, on waste-info.com.au. */
export const begaValley = createWasteInfoCouncil({
  id: 'nsw/bega-valley',
  name: 'Bega Valley Shire Council',
  state: 'NSW',
  lgaCodes: ['10550'],
  timezone: 'Australia/Sydney',
  subdomain: 'bega',
});
