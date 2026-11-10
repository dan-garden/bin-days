import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** City of Ryde, which runs on OpenCities. */
export const ryde = createOpenCitiesCouncil({
  id: 'nsw/ryde',
  name: 'City of Ryde',
  state: 'NSW',
  lgaCodes: ['16700'],
  timezone: 'Australia/Sydney',
  baseUrl: 'https://www.ryde.nsw.gov.au',
});
