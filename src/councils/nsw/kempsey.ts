import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Kempsey Shire Council, which runs on OpenCities. */
export const kempsey = createOpenCitiesCouncil({
  id: 'nsw/kempsey',
  name: 'Kempsey Shire Council',
  state: 'NSW',
  lgaCodes: ['14350'],
  timezone: 'Australia/Sydney',
  baseUrl: 'https://www.kempsey.nsw.gov.au',
});
