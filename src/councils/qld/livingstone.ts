import { createWasteInfoCouncil } from '../../platforms/waste-info.js';

/** Livingstone Shire Council, on waste-info.com.au. */
export const livingstone = createWasteInfoCouncil({
  id: 'qld/livingstone',
  name: 'Livingstone Shire Council',
  state: 'QLD',
  lgaCodes: ['34530'],
  timezone: 'Australia/Brisbane',
  subdomain: 'livingstone',
});
