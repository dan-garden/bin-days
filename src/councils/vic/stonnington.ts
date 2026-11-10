import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Stonnington City Council, which runs on OpenCities. */
export const stonnington = createOpenCitiesCouncil({
  id: 'vic/stonnington',
  name: 'Stonnington City Council',
  state: 'VIC',
  lgaCodes: ['26350'],
  timezone: 'Australia/Melbourne',
  baseUrl: 'https://www.stonnington.vic.gov.au',
});
