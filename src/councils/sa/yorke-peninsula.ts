import { createMyLocalServicesCouncil } from '../../platforms/my-local-services.js';

/** Yorke Peninsula Council, via South Australia's My Local Services. */
export const yorkePeninsula = createMyLocalServicesCouncil({
  id: 'sa/yorke-peninsula',
  name: 'Yorke Peninsula Council',
  state: 'SA',
  lgaCodes: ['48830'],
  timezone: 'Australia/Adelaide',
  website: 'https://yorke.sa.gov.au',
});
