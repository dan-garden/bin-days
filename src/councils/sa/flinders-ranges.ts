import { createMyLocalServicesCouncil } from '../../platforms/my-local-services.js';

/** The Flinders Ranges Council, via South Australia's My Local Services. */
export const flindersRanges = createMyLocalServicesCouncil({
  id: 'sa/flinders-ranges',
  name: 'The Flinders Ranges Council',
  state: 'SA',
  lgaCodes: ['41830'],
  timezone: 'Australia/Adelaide',
  website: 'https://www.frc.sa.gov.au',
});
