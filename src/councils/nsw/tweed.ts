import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Tweed Shire Council, which runs on OpenCities. */
export const tweed = createOpenCitiesCouncil({
  id: 'nsw/tweed',
  name: 'Tweed Shire Council',
  state: 'NSW',
  lgaCodes: ['17550'],
  timezone: 'Australia/Sydney',
  baseUrl: 'https://www.tweed.nsw.gov.au',
});
