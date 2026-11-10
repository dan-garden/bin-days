import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Glenelg Shire Council, which runs on OpenCities. */
export const glenelg = createOpenCitiesCouncil({
  id: 'vic/glenelg',
  name: 'Glenelg Shire Council',
  state: 'VIC',
  lgaCodes: ['22410'],
  timezone: 'Australia/Melbourne',
  baseUrl: 'https://www.glenelg.vic.gov.au',
});
