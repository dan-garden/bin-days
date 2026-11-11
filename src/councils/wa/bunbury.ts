import { createWasteInfoCouncil } from '../../platforms/waste-info.js';

/** City of Bunbury, on waste-info.com.au. */
export const bunbury = createWasteInfoCouncil({
  id: 'wa/bunbury',
  name: 'City of Bunbury',
  state: 'WA',
  lgaCodes: ['51190'],
  timezone: 'Australia/Perth',
  website: 'https://www.bunbury.wa.gov.au',
  subdomain: 'bunbury',
});
