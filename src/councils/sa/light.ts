import { createMyLocalServicesCouncil } from '../../platforms/my-local-services.js';

/** Light Regional Council, via South Australia's My Local Services. */
export const light = createMyLocalServicesCouncil({
  id: 'sa/light',
  name: 'Light Regional Council',
  state: 'SA',
  lgaCodes: ['43650'],
  timezone: 'Australia/Adelaide',
  website: 'https://www.light.sa.gov.au',
});
