import { createMyLocalServicesCouncil } from '../../platforms/my-local-services.js';

/** Wakefield Regional Council, via South Australia's My Local Services. */
export const wakefield = createMyLocalServicesCouncil({
  id: 'sa/wakefield',
  name: 'Wakefield Regional Council',
  state: 'SA',
  lgaCodes: ['48130'],
  timezone: 'Australia/Adelaide',
  website: 'https://www.wakefieldrc.sa.gov.au',
});
