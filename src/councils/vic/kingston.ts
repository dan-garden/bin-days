import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Kingston City Council, which runs on OpenCities. */
export const kingstonVic = createOpenCitiesCouncil({
  id: 'vic/kingston',
  name: 'Kingston City Council',
  state: 'VIC',
  lgaCodes: ['23430'],
  timezone: 'Australia/Melbourne',
  baseUrl: 'https://www.kingston.vic.gov.au',
});
