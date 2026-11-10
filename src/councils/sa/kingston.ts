import { createMyLocalServicesCouncil } from '../../platforms/my-local-services.js';

/** Kingston District Council, via South Australia's My Local Services. */
export const kingstonSa = createMyLocalServicesCouncil({
  id: 'sa/kingston',
  name: 'Kingston District Council',
  state: 'SA',
  lgaCodes: ['43360'],
  timezone: 'Australia/Adelaide',
});
