import { createMyLocalServicesCouncil } from '../../platforms/my-local-services.js';

/** Regional Council of Goyder, via South Australia's My Local Services. */
export const goyder = createMyLocalServicesCouncil({
  id: 'sa/goyder',
  name: 'Regional Council of Goyder',
  state: 'SA',
  lgaCodes: ['42110'],
  timezone: 'Australia/Adelaide',
  website: 'https://www.goyder.sa.gov.au',
});
