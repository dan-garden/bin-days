import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Hornsby Shire Council, which runs on OpenCities. */
export const hornsby = createOpenCitiesCouncil({
  id: 'nsw/hornsby',
  name: 'Hornsby Shire Council',
  state: 'NSW',
  lgaCodes: ['14000'],
  timezone: 'Australia/Sydney',
  baseUrl: 'https://www.hornsby.nsw.gov.au',
});
