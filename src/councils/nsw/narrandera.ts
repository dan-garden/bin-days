import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Narrandera Shire Council, which runs on OpenCities. */
export const narrandera = createOpenCitiesCouncil({
  id: 'nsw/narrandera',
  name: 'Narrandera Shire Council',
  state: 'NSW',
  lgaCodes: ['15800'],
  timezone: 'Australia/Sydney',
  baseUrl: 'https://www.narrandera.nsw.gov.au',
});
