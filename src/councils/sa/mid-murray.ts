import { createMyLocalServicesCouncil } from '../../platforms/my-local-services.js';

/** Mid Murray Council, via South Australia's My Local Services. */
export const midMurray = createMyLocalServicesCouncil({
  id: 'sa/mid-murray',
  name: 'Mid Murray Council',
  state: 'SA',
  lgaCodes: ['44210'],
  timezone: 'Australia/Adelaide',
  website: 'https://www.mid-murray.sa.gov.au',
});
