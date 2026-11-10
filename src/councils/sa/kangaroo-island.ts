import { createMyLocalServicesCouncil } from '../../platforms/my-local-services.js';

/** Kangaroo Island Council, via South Australia's My Local Services. */
export const kangarooIsland = createMyLocalServicesCouncil({
  id: 'sa/kangaroo-island',
  name: 'Kangaroo Island Council',
  state: 'SA',
  lgaCodes: ['42750'],
  timezone: 'Australia/Adelaide',
});
