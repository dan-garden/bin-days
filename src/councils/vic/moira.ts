import { createWasteInfoCouncil } from '../../platforms/waste-info.js';

/** Moira Shire Council, on waste-info.com.au. */
export const moira = createWasteInfoCouncil({
  id: 'vic/moira',
  name: 'Moira Shire Council',
  state: 'VIC',
  lgaCodes: ['24900'],
  timezone: 'Australia/Melbourne',
  subdomain: 'moira',
});
