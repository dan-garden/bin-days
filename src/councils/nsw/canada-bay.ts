import { createWasteInfoCouncil } from '../../platforms/waste-info.js';

/** City of Canada Bay, on waste-info.com.au. */
export const canadaBay = createWasteInfoCouncil({
  id: 'nsw/canada-bay',
  name: 'City of Canada Bay',
  state: 'NSW',
  lgaCodes: ['11520'],
  timezone: 'Australia/Sydney',
  subdomain: 'canada-bay',
});
