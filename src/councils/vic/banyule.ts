import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Banyule City Council, which runs on OpenCities. */
export const banyule = createOpenCitiesCouncil({
  id: 'vic/banyule',
  name: 'Banyule City Council',
  state: 'VIC',
  lgaCodes: ['20660'],
  timezone: 'Australia/Melbourne',
  baseUrl: 'https://www.banyule.vic.gov.au',
});
