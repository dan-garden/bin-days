import { createMyLocalServicesCouncil } from '../../platforms/my-local-services.js';

/** Northern Areas Council, via South Australia's My Local Services. */
export const northernAreas = createMyLocalServicesCouncil({
  id: 'sa/northern-areas',
  name: 'Northern Areas Council',
  state: 'SA',
  lgaCodes: ['45120'],
  timezone: 'Australia/Adelaide',
  website: 'https://www.nacouncil.sa.gov.au',
});
