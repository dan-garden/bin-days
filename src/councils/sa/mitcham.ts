import { createMyLocalServicesCouncil } from '../../platforms/my-local-services.js';

/** City of Mitcham, via South Australia's My Local Services. */
export const mitcham = createMyLocalServicesCouncil({
  id: 'sa/mitcham',
  name: 'City of Mitcham',
  state: 'SA',
  lgaCodes: ['44340'],
  timezone: 'Australia/Adelaide',
  website: 'https://www.mitchamcouncil.sa.gov.au',
});
