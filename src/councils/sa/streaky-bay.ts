import { createMyLocalServicesCouncil } from '../../platforms/my-local-services.js';

/** District Council of Streaky Bay, via South Australia's My Local Services. */
export const streakyBay = createMyLocalServicesCouncil({
  id: 'sa/streaky-bay',
  name: 'District Council of Streaky Bay',
  state: 'SA',
  lgaCodes: ['47490'],
  timezone: 'Australia/Adelaide',
  website: 'https://www.streakybay.sa.gov.au',
});
