import { createMyLocalServicesCouncil } from '../../platforms/my-local-services.js';

/** City of Charles Sturt, via South Australia's My Local Services. */
export const charlesSturt = createMyLocalServicesCouncil({
  id: 'sa/charles-sturt',
  name: 'City of Charles Sturt',
  state: 'SA',
  lgaCodes: ['41060'],
  timezone: 'Australia/Adelaide',
  website: 'https://www.charlessturt.sa.gov.au',
});
