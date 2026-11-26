import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Murray River Council, which runs on OpenCities. */
export const murrayRiver = createOpenCitiesCouncil({
  id: 'nsw/murray-river',
  name: 'Murray River Council',
  state: 'NSW',
  lgaCodes: ['15520'],
  timezone: 'Australia/Sydney',
  baseUrl: 'https://www.murrayriver.nsw.gov.au',
});
