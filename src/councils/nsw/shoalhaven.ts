import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Shoalhaven City Council, which runs on OpenCities. */
export const shoalhaven = createOpenCitiesCouncil({
  id: 'nsw/shoalhaven',
  name: 'Shoalhaven City Council',
  state: 'NSW',
  lgaCodes: ['16950'],
  timezone: 'Australia/Sydney',
  baseUrl: 'https://www.shoalhaven.nsw.gov.au',
});
