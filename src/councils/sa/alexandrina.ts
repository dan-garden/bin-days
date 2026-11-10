import { createMyLocalServicesCouncil } from '../../platforms/my-local-services.js';

/** Alexandrina Council, via South Australia's My Local Services. */
export const alexandrina = createMyLocalServicesCouncil({
  id: 'sa/alexandrina',
  name: 'Alexandrina Council',
  state: 'SA',
  lgaCodes: ['40220'],
  timezone: 'Australia/Adelaide',
  website: 'https://www.alexandrina.sa.gov.au',
});
