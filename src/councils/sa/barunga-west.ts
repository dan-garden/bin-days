import { createMyLocalServicesCouncil } from '../../platforms/my-local-services.js';

/** Barunga West Council, via South Australia's My Local Services. */
export const barungaWest = createMyLocalServicesCouncil({
  id: 'sa/barunga-west',
  name: 'Barunga West Council',
  state: 'SA',
  lgaCodes: ['40430'],
  timezone: 'Australia/Adelaide',
  website: 'https://www.barungawest.sa.gov.au',
});
