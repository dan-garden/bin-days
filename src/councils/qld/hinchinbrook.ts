import { createWasteInfoCouncil } from '../../platforms/waste-info.js';

/** Hinchinbrook Shire Council, on waste-info.com.au. */
export const hinchinbrook = createWasteInfoCouncil({
  id: 'qld/hinchinbrook',
  name: 'Hinchinbrook Shire Council',
  state: 'QLD',
  lgaCodes: ['33800'],
  timezone: 'Australia/Brisbane',
  website: 'https://www.hinchinbrook.qld.gov.au',
  subdomain: 'hinchinbrook',
});
