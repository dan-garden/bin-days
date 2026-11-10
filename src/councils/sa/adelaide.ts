import { createMyLocalServicesCouncil } from '../../platforms/my-local-services.js';

/** City of Adelaide, via South Australia's My Local Services. */
export const adelaide = createMyLocalServicesCouncil({
  id: 'sa/adelaide',
  name: 'City of Adelaide',
  state: 'SA',
  lgaCodes: ['40070'],
  timezone: 'Australia/Adelaide',
  website: 'https://www.adelaidecitycouncil.com',
});
