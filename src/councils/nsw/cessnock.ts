import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Cessnock City Council, which runs on OpenCities. */
export const cessnock = createOpenCitiesCouncil({
  id: 'nsw/cessnock',
  name: 'Cessnock City Council',
  state: 'NSW',
  lgaCodes: ['11720'],
  timezone: 'Australia/Sydney',
  baseUrl: 'https://www.cessnock.nsw.gov.au',
});
