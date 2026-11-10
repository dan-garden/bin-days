import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** City of Unley, which runs on OpenCities. */
export const unley = createOpenCitiesCouncil({
  id: 'sa/unley',
  name: 'City of Unley',
  state: 'SA',
  lgaCodes: ['47980'],
  timezone: 'Australia/Adelaide',
  baseUrl: 'https://www.unley.sa.gov.au',
});
