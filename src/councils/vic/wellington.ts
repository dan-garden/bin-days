import { createWasteInfoCouncil } from '../../platforms/waste-info.js';

/** Wellington Shire Council, on waste-info.com.au. */
export const wellington = createWasteInfoCouncil({
  id: 'vic/wellington',
  name: 'Wellington Shire Council',
  state: 'VIC',
  lgaCodes: ['26810'],
  timezone: 'Australia/Melbourne',
  subdomain: 'wellington',
});
