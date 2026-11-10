import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Blacktown City Council, which runs on OpenCities. */
export const blacktown = createOpenCitiesCouncil({
  id: 'nsw/blacktown',
  name: 'Blacktown City Council',
  state: 'NSW',
  lgaCodes: ['10750'],
  timezone: 'Australia/Sydney',
  baseUrl: 'https://www.blacktown.nsw.gov.au',
});
