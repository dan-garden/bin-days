import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Gannawarra Shire Council, which runs on OpenCities. */
export const gannawarra = createOpenCitiesCouncil({
  id: 'vic/gannawarra',
  name: 'Gannawarra Shire Council',
  state: 'VIC',
  lgaCodes: ['22250'],
  timezone: 'Australia/Melbourne',
  baseUrl: 'https://www.gannawarra.vic.gov.au',
});
