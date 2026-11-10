import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Upper Hunter Shire Council, which runs on OpenCities. */
export const upperHunter = createOpenCitiesCouncil({
  id: 'nsw/upper-hunter',
  name: 'Upper Hunter Shire Council',
  state: 'NSW',
  lgaCodes: ['17620'],
  timezone: 'Australia/Sydney',
  baseUrl: 'https://www.upperhunter.nsw.gov.au',
});
