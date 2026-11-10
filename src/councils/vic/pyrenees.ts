import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Pyrenees Shire Council, which runs on OpenCities. */
export const pyrenees = createOpenCitiesCouncil({
  id: 'vic/pyrenees',
  name: 'Pyrenees Shire Council',
  state: 'VIC',
  lgaCodes: ['25990'],
  timezone: 'Australia/Melbourne',
  baseUrl: 'https://www.pyrenees.vic.gov.au',
});
