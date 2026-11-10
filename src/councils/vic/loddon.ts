import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Loddon Shire Council, which runs on OpenCities. */
export const loddon = createOpenCitiesCouncil({
  id: 'vic/loddon',
  name: 'Loddon Shire Council',
  state: 'VIC',
  lgaCodes: ['23940'],
  timezone: 'Australia/Melbourne',
  baseUrl: 'https://www.loddon.vic.gov.au',
});
