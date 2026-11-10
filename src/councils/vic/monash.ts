import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Monash City Council, which runs on OpenCities. */
export const monash = createOpenCitiesCouncil({
  id: 'vic/monash',
  name: 'Monash City Council',
  state: 'VIC',
  lgaCodes: ['24970'],
  timezone: 'Australia/Melbourne',
  baseUrl: 'https://www.monash.vic.gov.au',
});
