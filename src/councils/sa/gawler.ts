import { createMyLocalServicesCouncil } from '../../platforms/my-local-services.js';

/** Town of Gawler, via South Australia's My Local Services. */
export const gawler = createMyLocalServicesCouncil({
  id: 'sa/gawler',
  name: 'Town of Gawler',
  state: 'SA',
  lgaCodes: ['42030'],
  timezone: 'Australia/Adelaide',
});
