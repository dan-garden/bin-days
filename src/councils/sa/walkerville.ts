import { createMyLocalServicesCouncil } from '../../platforms/my-local-services.js';

/** Town of Walkerville, via South Australia's My Local Services. */
export const walkerville = createMyLocalServicesCouncil({
  id: 'sa/walkerville',
  name: 'Town of Walkerville',
  state: 'SA',
  lgaCodes: ['48260'],
  timezone: 'Australia/Adelaide',
  website: 'https://www.walkerville.sa.gov.au',
});
