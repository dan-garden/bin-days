import { createWasteInfoCouncil } from '../../platforms/waste-info.js';

/** Port Macquarie-Hastings Council, on waste-info.com.au. */
export const portMacquarieHastings = createWasteInfoCouncil({
  id: 'nsw/port-macquarie-hastings',
  name: 'Port Macquarie-Hastings Council',
  state: 'NSW',
  lgaCodes: ['16380'],
  timezone: 'Australia/Sydney',
  subdomain: 'pmhc',
});
