import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Wangaratta Rural City Council, which runs on OpenCities. */
export const wangaratta = createOpenCitiesCouncil({
  id: 'vic/wangaratta',
  name: 'Wangaratta Rural City Council',
  state: 'VIC',
  lgaCodes: ['26700'],
  timezone: 'Australia/Melbourne',
  baseUrl: 'https://www.wangaratta.vic.gov.au',
});
