import { createMyLocalServicesCouncil } from '../../platforms/my-local-services.js';

/** Coorong District Council, via South Australia's My Local Services. */
export const coorong = createMyLocalServicesCouncil({
  id: 'sa/coorong',
  name: 'Coorong District Council',
  state: 'SA',
  lgaCodes: ['47800'],
  timezone: 'Australia/Adelaide',
  website: 'https://www.coorong.sa.gov.au',
});
