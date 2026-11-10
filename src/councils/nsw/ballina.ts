import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Ballina Shire Council, which runs on OpenCities. */
export const ballina = createOpenCitiesCouncil({
  id: 'nsw/ballina',
  name: 'Ballina Shire Council',
  state: 'NSW',
  lgaCodes: ['10250'],
  timezone: 'Australia/Sydney',
  baseUrl: 'https://www.ballina.nsw.gov.au',
});
