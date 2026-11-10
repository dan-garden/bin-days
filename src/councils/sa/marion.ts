import { createMyLocalServicesCouncil } from '../../platforms/my-local-services.js';

/** City of Marion, via South Australia's My Local Services. */
export const marion = createMyLocalServicesCouncil({
  id: 'sa/marion',
  name: 'City of Marion',
  state: 'SA',
  lgaCodes: ['44060'],
  timezone: 'Australia/Adelaide',
});
