import { createMyLocalServicesCouncil } from '../../platforms/my-local-services.js';

/** Campbelltown City Council, via South Australia's My Local Services. */
export const campbelltownSa = createMyLocalServicesCouncil({
  id: 'sa/campbelltown',
  name: 'Campbelltown City Council',
  state: 'SA',
  lgaCodes: ['40910'],
  timezone: 'Australia/Adelaide',
  website: 'https://www.campbelltown.sa.gov.au',
});
