import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Swan Hill Rural City Council, which runs on OpenCities. */
export const swanHill = createOpenCitiesCouncil({
  id: 'vic/swan-hill',
  name: 'Swan Hill Rural City Council',
  state: 'VIC',
  lgaCodes: ['26610'],
  timezone: 'Australia/Melbourne',
  baseUrl: 'https://www.swanhill.vic.gov.au',
});
