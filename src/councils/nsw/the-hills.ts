import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** The Hills Shire Council, which runs on OpenCities. */
export const theHills = createOpenCitiesCouncil({
  id: 'nsw/the-hills',
  name: 'The Hills Shire Council',
  state: 'NSW',
  lgaCodes: ['17420'],
  timezone: 'Australia/Sydney',
  baseUrl: 'https://www.thehills.nsw.gov.au',
});
