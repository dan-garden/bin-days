import { createMyLocalServicesCouncil } from '../../platforms/my-local-services.js';

/** Adelaide Plains Council, via South Australia's My Local Services. */
export const adelaidePlains = createMyLocalServicesCouncil({
  id: 'sa/adelaide-plains',
  name: 'Adelaide Plains Council',
  state: 'SA',
  lgaCodes: ['40150'],
  timezone: 'Australia/Adelaide',
  website: 'https://www.apc.sa.gov.au',
});
