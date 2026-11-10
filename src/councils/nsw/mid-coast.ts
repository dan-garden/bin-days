import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** MidCoast Council, which runs on OpenCities. */
export const midCoast = createOpenCitiesCouncil({
  id: 'nsw/mid-coast',
  name: 'MidCoast Council',
  state: 'NSW',
  lgaCodes: ['15240'],
  timezone: 'Australia/Sydney',
  baseUrl: 'https://www.midcoast.nsw.gov.au',
});
