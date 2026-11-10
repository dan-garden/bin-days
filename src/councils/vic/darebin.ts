import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Darebin City Council, which runs on OpenCities. */
export const darebin = createOpenCitiesCouncil({
  id: 'vic/darebin',
  name: 'Darebin City Council',
  state: 'VIC',
  lgaCodes: ['21890'],
  timezone: 'Australia/Melbourne',
  baseUrl: 'https://www.darebin.vic.gov.au',
});
