import { createMyLocalServicesCouncil } from '../../platforms/my-local-services.js';

/** District Council of Elliston, via South Australia's My Local Services. */
export const elliston = createMyLocalServicesCouncil({
  id: 'sa/elliston',
  name: 'District Council of Elliston',
  state: 'SA',
  lgaCodes: ['41750'],
  timezone: 'Australia/Adelaide',
  website: 'https://www.elliston.sa.gov.au',
});
