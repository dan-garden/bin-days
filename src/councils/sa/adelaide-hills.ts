import { createMyLocalServicesCouncil } from '../../platforms/my-local-services.js';

/** Adelaide Hills Council, via South Australia's My Local Services. */
export const adelaideHills = createMyLocalServicesCouncil({
  id: 'sa/adelaide-hills',
  name: 'Adelaide Hills Council',
  state: 'SA',
  lgaCodes: ['40120'],
  timezone: 'Australia/Adelaide',
  website: 'https://www.ahc.sa.gov.au',
});
