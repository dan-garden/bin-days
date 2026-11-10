import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Armidale Regional Council, which runs on OpenCities. */
export const armidale = createOpenCitiesCouncil({
  id: 'nsw/armidale',
  name: 'Armidale Regional Council',
  state: 'NSW',
  lgaCodes: ['10180'],
  timezone: 'Australia/Sydney',
  baseUrl: 'https://www.armidale.nsw.gov.au',
});
