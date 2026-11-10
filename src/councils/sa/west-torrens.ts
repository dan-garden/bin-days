import { createMyLocalServicesCouncil } from '../../platforms/my-local-services.js';

/** City of West Torrens, via South Australia's My Local Services. */
export const westTorrens = createMyLocalServicesCouncil({
  id: 'sa/west-torrens',
  name: 'City of West Torrens',
  state: 'SA',
  lgaCodes: ['48410'],
  timezone: 'Australia/Adelaide',
  website: 'https://www.westtorrens.sa.gov.au',
});
