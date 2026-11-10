import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Melton City Council, which runs on OpenCities. */
export const melton = createOpenCitiesCouncil({
  id: 'vic/melton',
  name: 'Melton City Council',
  state: 'VIC',
  lgaCodes: ['24650'],
  timezone: 'Australia/Melbourne',
  baseUrl: 'https://www.melton.vic.gov.au',
});
