import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Colac Otway Shire Council, which runs on OpenCities. */
export const colacOtway = createOpenCitiesCouncil({
  id: 'vic/colac-otway',
  name: 'Colac Otway Shire Council',
  state: 'VIC',
  lgaCodes: ['21750'],
  timezone: 'Australia/Melbourne',
  baseUrl: 'https://www.colacotway.vic.gov.au',
});
