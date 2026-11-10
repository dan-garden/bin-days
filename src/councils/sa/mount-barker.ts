import { createMyLocalServicesCouncil } from '../../platforms/my-local-services.js';

/** District Council of Mount Barker, via South Australia's My Local Services. */
export const mountBarker = createMyLocalServicesCouncil({
  id: 'sa/mount-barker',
  name: 'District Council of Mount Barker',
  state: 'SA',
  lgaCodes: ['44550'],
  timezone: 'Australia/Adelaide',
  website: 'https://www.mountbarker.sa.gov.au',
});
