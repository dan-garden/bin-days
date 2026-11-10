import { createMyLocalServicesCouncil } from '../../platforms/my-local-services.js';

/** City of Playford, via South Australia's My Local Services. */
export const playford = createMyLocalServicesCouncil({
  id: 'sa/playford',
  name: 'City of Playford',
  state: 'SA',
  lgaCodes: ['45680'],
  timezone: 'Australia/Adelaide',
});
