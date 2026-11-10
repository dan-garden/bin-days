import { createMyLocalServicesCouncil } from '../../platforms/my-local-services.js';

/** District Council of Tumby Bay, via South Australia's My Local Services. */
export const tumbyBay = createMyLocalServicesCouncil({
  id: 'sa/tumby-bay',
  name: 'District Council of Tumby Bay',
  state: 'SA',
  lgaCodes: ['47910'],
  timezone: 'Australia/Adelaide',
});
