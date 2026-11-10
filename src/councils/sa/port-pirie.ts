import { createMyLocalServicesCouncil } from '../../platforms/my-local-services.js';

/** Port Pirie Regional Council, via South Australia's My Local Services. */
export const portPirie = createMyLocalServicesCouncil({
  id: 'sa/port-pirie',
  name: 'Port Pirie Regional Council',
  state: 'SA',
  lgaCodes: ['46450'],
  timezone: 'Australia/Adelaide',
  website: 'https://www.pirie.sa.gov.au',
});
