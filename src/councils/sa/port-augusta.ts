import { createMyLocalServicesCouncil } from '../../platforms/my-local-services.js';

/** Port Augusta City Council, via South Australia's My Local Services. */
export const portAugusta = createMyLocalServicesCouncil({
  id: 'sa/port-augusta',
  name: 'Port Augusta City Council',
  state: 'SA',
  lgaCodes: ['46090'],
  timezone: 'Australia/Adelaide',
  website: 'https://www.portaugusta.sa.gov.au',
});
