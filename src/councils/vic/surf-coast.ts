import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Surf Coast Shire Council, which runs on OpenCities. */
export const surfCoast = createOpenCitiesCouncil({
  id: 'vic/surf-coast',
  name: 'Surf Coast Shire Council',
  state: 'VIC',
  lgaCodes: ['26490'],
  timezone: 'Australia/Melbourne',
  baseUrl: 'https://www.surfcoast.vic.gov.au',
});
