import { createMyLocalServicesCouncil } from '../../platforms/my-local-services.js';

/** Renmark Paringa Council, via South Australia's My Local Services. */
export const renmarkParinga = createMyLocalServicesCouncil({
  id: 'sa/renmark-paringa',
  name: 'Renmark Paringa Council',
  state: 'SA',
  lgaCodes: ['46670'],
  timezone: 'Australia/Adelaide',
  website: 'https://www.renmarkparinga.sa.gov.au',
});
