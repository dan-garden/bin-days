import { createMyLocalServicesCouncil } from '../../platforms/my-local-services.js';

/** City of Mount Gambier, via South Australia's My Local Services. */
export const mountGambier = createMyLocalServicesCouncil({
  id: 'sa/mount-gambier',
  name: 'City of Mount Gambier',
  state: 'SA',
  lgaCodes: ['44620'],
  timezone: 'Australia/Adelaide',
  website: 'https://www.mountgambier.sa.gov.au',
});
