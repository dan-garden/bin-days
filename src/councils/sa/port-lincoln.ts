import { createMyLocalServicesCouncil } from '../../platforms/my-local-services.js';

/** City of Port Lincoln, via South Australia's My Local Services. */
export const portLincoln = createMyLocalServicesCouncil({
  id: 'sa/port-lincoln',
  name: 'City of Port Lincoln',
  state: 'SA',
  lgaCodes: ['46300'],
  timezone: 'Australia/Adelaide',
});
