import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Moorabool Shire Council, which runs on OpenCities. */
export const moorabool = createOpenCitiesCouncil({
  id: 'vic/moorabool',
  name: 'Moorabool Shire Council',
  state: 'VIC',
  lgaCodes: ['25150'],
  timezone: 'Australia/Melbourne',
  baseUrl: 'https://www.moorabool.vic.gov.au',
});
