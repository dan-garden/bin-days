import { createMyLocalServicesCouncil } from '../../platforms/my-local-services.js';

/** Berri Barmera Council, via South Australia's My Local Services. */
export const berriBarmera = createMyLocalServicesCouncil({
  id: 'sa/berri-barmera',
  name: 'Berri Barmera Council',
  state: 'SA',
  lgaCodes: ['40520'],
  timezone: 'Australia/Adelaide',
  website: 'https://www.berribarmera.sa.gov.au',
});
