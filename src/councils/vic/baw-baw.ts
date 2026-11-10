import { createWasteInfoCouncil } from '../../platforms/waste-info.js';

/** Baw Baw Shire Council, on waste-info.com.au. */
export const bawBaw = createWasteInfoCouncil({
  id: 'vic/baw-baw',
  name: 'Baw Baw Shire Council',
  state: 'VIC',
  lgaCodes: ['20830'],
  timezone: 'Australia/Melbourne',
  subdomain: 'baw-baw',
});
