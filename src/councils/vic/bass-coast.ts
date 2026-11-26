import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Bass Coast Shire Council, which runs on OpenCities. */
export const bassCoast = createOpenCitiesCouncil({
  id: 'vic/bass-coast',
  name: 'Bass Coast Shire Council',
  state: 'VIC',
  lgaCodes: ['20740'],
  timezone: 'Australia/Melbourne',
  baseUrl: 'https://www.basscoast.vic.gov.au',
});
