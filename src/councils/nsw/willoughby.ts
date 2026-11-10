import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Willoughby City Council, which runs on OpenCities. */
export const willoughby = createOpenCitiesCouncil({
  id: 'nsw/willoughby',
  name: 'Willoughby City Council',
  state: 'NSW',
  lgaCodes: ['18250'],
  timezone: 'Australia/Sydney',
  baseUrl: 'https://www.willoughby.nsw.gov.au',
});
