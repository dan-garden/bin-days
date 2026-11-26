import { createWasteInfoCouncil } from '../../platforms/waste-info.js';

/** Narrabri Shire Council, on waste-info.com.au. */
export const narrabri = createWasteInfoCouncil({
  id: 'nsw/narrabri',
  name: 'Narrabri Shire Council',
  state: 'NSW',
  lgaCodes: ['15750'],
  timezone: 'Australia/Sydney',
  website: 'https://www.narrabri.nsw.gov.au',
  subdomain: 'narrabri',
});
