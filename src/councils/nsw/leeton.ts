import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Leeton Shire Council, which runs on OpenCities. */
export const leeton = createOpenCitiesCouncil({
  id: 'nsw/leeton',
  name: 'Leeton Shire Council',
  state: 'NSW',
  lgaCodes: ['14750'],
  timezone: 'Australia/Sydney',
  baseUrl: 'https://www.leeton.nsw.gov.au',
});
