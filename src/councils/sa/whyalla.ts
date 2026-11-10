import { createMyLocalServicesCouncil } from '../../platforms/my-local-services.js';

/** City of Whyalla, via South Australia's My Local Services. */
export const whyalla = createMyLocalServicesCouncil({
  id: 'sa/whyalla',
  name: 'City of Whyalla',
  state: 'SA',
  lgaCodes: ['48540'],
  timezone: 'Australia/Adelaide',
  website: 'https://www.whyalla.sa.gov.au',
});
