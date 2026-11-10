import { createMyLocalServicesCouncil } from '../../platforms/my-local-services.js';

/** Copper Coast Council, via South Australia's My Local Services. */
export const copperCoast = createMyLocalServicesCouncil({
  id: 'sa/copper-coast',
  name: 'Copper Coast Council',
  state: 'SA',
  lgaCodes: ['41560'],
  timezone: 'Australia/Adelaide',
  website: 'https://www.coppercoast.sa.gov.au',
});
