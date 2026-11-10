import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Hunter's Hill Council, which runs on OpenCities. */
export const huntersHill = createOpenCitiesCouncil({
  id: 'nsw/hunters-hill',
  name: "Hunter's Hill Council",
  state: 'NSW',
  lgaCodes: ['14100'],
  timezone: 'Australia/Sydney',
  baseUrl: 'https://www.huntershill.nsw.gov.au',
});
