import { createMyLocalServicesCouncil } from '../../platforms/my-local-services.js';

/** Southern Mallee District Council, via South Australia's My Local Services. */
export const southernMallee = createMyLocalServicesCouncil({
  id: 'sa/southern-mallee',
  name: 'Southern Mallee District Council',
  state: 'SA',
  lgaCodes: ['47290'],
  timezone: 'Australia/Adelaide',
  website: 'https://www.southernmallee.sa.gov.au',
});
