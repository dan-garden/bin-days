import { createMyLocalServicesCouncil } from '../../platforms/my-local-services.js';

/** Yankalilla District Council, via South Australia's My Local Services. */
export const yankalilla = createMyLocalServicesCouncil({
  id: 'sa/yankalilla',
  name: 'Yankalilla District Council',
  state: 'SA',
  lgaCodes: ['48750'],
  timezone: 'Australia/Adelaide',
  website: 'https://www.yankalilla.sa.gov.au',
});
