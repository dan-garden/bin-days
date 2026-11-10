import { createMyLocalServicesCouncil } from '../../platforms/my-local-services.js';

/** City of Prospect, via South Australia's My Local Services. */
export const prospect = createMyLocalServicesCouncil({
  id: 'sa/prospect',
  name: 'City of Prospect',
  state: 'SA',
  lgaCodes: ['46510'],
  timezone: 'Australia/Adelaide',
  website: 'https://www.prospect.sa.gov.au',
});
