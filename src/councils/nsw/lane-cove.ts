import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Lane Cove Council, which runs on OpenCities. */
export const laneCove = createOpenCitiesCouncil({
  id: 'nsw/lane-cove',
  name: 'Lane Cove Council',
  state: 'NSW',
  lgaCodes: ['14700'],
  timezone: 'Australia/Sydney',
  baseUrl: 'https://www.lanecove.nsw.gov.au',
  // The red bin takes food scraps too.
  binTypes: { 'General Waste & Food Waste': 'general' },
});
