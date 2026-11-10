import { createMyLocalServicesCouncil } from '../../platforms/my-local-services.js';

/** District Council of Robe, via South Australia's My Local Services. */
export const robe = createMyLocalServicesCouncil({
  id: 'sa/robe',
  name: 'District Council of Robe',
  state: 'SA',
  lgaCodes: ['46860'],
  timezone: 'Australia/Adelaide',
  website: 'https://www.robe.sa.gov.au',
});
