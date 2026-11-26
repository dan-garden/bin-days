import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Broken Hill City Council, which runs on OpenCities. */
export const brokenHill = createOpenCitiesCouncil({
  id: 'nsw/broken-hill',
  name: 'Broken Hill City Council',
  state: 'NSW',
  lgaCodes: ['11250'],
  timezone: 'Australia/Broken_Hill',
  baseUrl: 'https://www.brokenhill.nsw.gov.au',
});
