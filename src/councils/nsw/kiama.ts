import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Kiama Municipal Council, which runs on OpenCities. */
export const kiama = createOpenCitiesCouncil({
  id: 'nsw/kiama',
  name: 'Kiama Municipal Council',
  state: 'NSW',
  lgaCodes: ['14400'],
  timezone: 'Australia/Sydney',
  baseUrl: 'https://www.kiama.nsw.gov.au',
});
