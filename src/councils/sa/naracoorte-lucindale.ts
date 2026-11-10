import { createMyLocalServicesCouncil } from '../../platforms/my-local-services.js';

/** Naracoorte Lucindale Council, via South Australia's My Local Services. */
export const naracoorteLucindale = createMyLocalServicesCouncil({
  id: 'sa/naracoorte-lucindale',
  name: 'Naracoorte Lucindale Council',
  state: 'SA',
  lgaCodes: ['45090'],
  timezone: 'Australia/Adelaide',
  website: 'https://www.naracoortelucindale.sa.gov.au',
});
