import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Lismore City Council, which runs on OpenCities. */
export const lismore = createOpenCitiesCouncil({
  id: 'nsw/lismore',
  name: 'Lismore City Council',
  state: 'NSW',
  lgaCodes: ['14850'],
  timezone: 'Australia/Sydney',
  baseUrl: 'https://www.lismore.nsw.gov.au',
});
