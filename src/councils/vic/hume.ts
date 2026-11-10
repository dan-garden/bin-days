import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Hume City Council, which runs on OpenCities. */
export const hume = createOpenCitiesCouncil({
  id: 'vic/hume',
  name: 'Hume City Council',
  state: 'VIC',
  lgaCodes: ['23270'],
  timezone: 'Australia/Melbourne',
  baseUrl: 'https://www.hume.vic.gov.au',
});
