import { createWasteInfoCouncil } from '../../platforms/waste-info.js';

/** Nambucca Valley Council, on waste-info.com.au. */
export const nambuccaValley = createWasteInfoCouncil({
  id: 'nsw/nambucca-valley',
  name: 'Nambucca Valley Council',
  state: 'NSW',
  lgaCodes: ['15700'],
  timezone: 'Australia/Sydney',
  website: 'https://www.nambucca.nsw.gov.au',
  subdomain: 'nambucca',
});
