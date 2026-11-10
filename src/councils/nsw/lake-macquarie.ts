import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Lake Macquarie City Council, which runs on OpenCities. */
export const lakeMacquarie = createOpenCitiesCouncil({
  id: 'nsw/lake-macquarie',
  name: 'Lake Macquarie City Council',
  state: 'NSW',
  lgaCodes: ['14650'],
  timezone: 'Australia/Sydney',
  baseUrl: 'https://www.lakemac.com.au',
});
