import { createWasteInfoCouncil } from '../../platforms/waste-info.js';

/** Wollongong City Council, on waste-info.com.au. */
export const wollongong = createWasteInfoCouncil({
  id: 'nsw/wollongong',
  name: 'Wollongong City Council',
  state: 'NSW',
  lgaCodes: ['18450'],
  timezone: 'Australia/Sydney',
  website: 'https://wollongongwaste.com',
  subdomain: 'wollongong',
});
