import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Maroondah City Council, which runs on OpenCities. */
export const maroondah = createOpenCitiesCouncil({
  id: 'vic/maroondah',
  name: 'Maroondah City Council',
  state: 'VIC',
  lgaCodes: ['24410'],
  timezone: 'Australia/Melbourne',
  baseUrl: 'https://www.maroondah.vic.gov.au',
});
