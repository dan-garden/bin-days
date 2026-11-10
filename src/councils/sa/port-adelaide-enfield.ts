import { createMyLocalServicesCouncil } from '../../platforms/my-local-services.js';

/** City of Port Adelaide Enfield, via South Australia's My Local Services. */
export const portAdelaideEnfield = createMyLocalServicesCouncil({
  id: 'sa/port-adelaide-enfield',
  name: 'City of Port Adelaide Enfield',
  state: 'SA',
  lgaCodes: ['45890'],
  timezone: 'Australia/Adelaide',
  website: 'https://www.cityofpae.sa.gov.au',
});
