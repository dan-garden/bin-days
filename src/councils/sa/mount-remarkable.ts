import { createMyLocalServicesCouncil } from '../../platforms/my-local-services.js';

/** District Council of Mount Remarkable, via South Australia's My Local Services. */
export const mountRemarkable = createMyLocalServicesCouncil({
  id: 'sa/mount-remarkable',
  name: 'District Council of Mount Remarkable',
  state: 'SA',
  lgaCodes: ['44830'],
  timezone: 'Australia/Adelaide',
  website: 'https://www.mtr.sa.gov.au',
});
