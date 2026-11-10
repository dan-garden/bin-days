import { createMyLocalServicesCouncil } from '../../platforms/my-local-services.js';

/** District Council of Cleve, via South Australia's My Local Services. */
export const cleve = createMyLocalServicesCouncil({
  id: 'sa/cleve',
  name: 'District Council of Cleve',
  state: 'SA',
  lgaCodes: ['41190'],
  timezone: 'Australia/Adelaide',
  website: 'https://www.cleve.sa.gov.au',
});
