import { createWasteInfoCouncil } from '../../platforms/waste-info.js';

/** Murrindindi Shire Council, on waste-info.com.au. */
export const murrindindi = createWasteInfoCouncil({
  id: 'vic/murrindindi',
  name: 'Murrindindi Shire Council',
  state: 'VIC',
  lgaCodes: ['25620'],
  timezone: 'Australia/Melbourne',
  subdomain: 'murrindindi',
});
