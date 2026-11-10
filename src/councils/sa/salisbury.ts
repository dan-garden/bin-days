import { createMyLocalServicesCouncil } from '../../platforms/my-local-services.js';

/** City of Salisbury, via South Australia's My Local Services. */
export const salisbury = createMyLocalServicesCouncil({
  id: 'sa/salisbury',
  name: 'City of Salisbury',
  state: 'SA',
  lgaCodes: ['47140'],
  timezone: 'Australia/Adelaide',
  website: 'https://www.salisbury.sa.gov.au',
});
