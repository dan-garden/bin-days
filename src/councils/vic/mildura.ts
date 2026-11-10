import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Mildura Rural City Council, which runs on OpenCities. */
export const mildura = createOpenCitiesCouncil({
  id: 'vic/mildura',
  name: 'Mildura Rural City Council',
  state: 'VIC',
  lgaCodes: ['24780'],
  timezone: 'Australia/Melbourne',
  baseUrl: 'https://www.mildura.vic.gov.au',
});
