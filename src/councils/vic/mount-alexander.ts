import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Mount Alexander Shire Council, which runs on OpenCities. */
export const mountAlexander = createOpenCitiesCouncil({
  id: 'vic/mount-alexander',
  name: 'Mount Alexander Shire Council',
  state: 'VIC',
  lgaCodes: ['25430'],
  timezone: 'Australia/Melbourne',
  baseUrl: 'https://www.mountalexander.vic.gov.au',
});
