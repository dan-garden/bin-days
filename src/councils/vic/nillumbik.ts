import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Nillumbik Shire Council, which runs on OpenCities. */
export const nillumbik = createOpenCitiesCouncil({
  id: 'vic/nillumbik',
  name: 'Nillumbik Shire Council',
  state: 'VIC',
  lgaCodes: ['25710'],
  timezone: 'Australia/Melbourne',
  baseUrl: 'https://www.nillumbik.vic.gov.au',
});
