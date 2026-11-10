import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Woollahra Municipal Council, which runs on OpenCities. */
export const woollahra = createOpenCitiesCouncil({
  id: 'nsw/woollahra',
  name: 'Woollahra Municipal Council',
  state: 'NSW',
  lgaCodes: ['18500'],
  timezone: 'Australia/Sydney',
  baseUrl: 'https://www.woollahra.nsw.gov.au',
});
