import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** City of Burnside, which runs on OpenCities. */
export const burnside = createOpenCitiesCouncil({
  id: 'sa/burnside',
  name: 'City of Burnside',
  state: 'SA',
  lgaCodes: ['40700'],
  timezone: 'Australia/Adelaide',
  baseUrl: 'https://www.burnside.sa.gov.au',
});
