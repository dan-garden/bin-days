import { createIntraMapsCouncil } from '../../platforms/intramaps.js';

/** Bathurst Regional Council, through its IntraMaps property map. */
export const bathurst = createIntraMapsCouncil({
  id: 'nsw/bathurst',
  name: 'Bathurst Regional Council',
  state: 'NSW',
  lgaCodes: ['10470'],
  timezone: 'Australia/Sydney',
  website: 'https://www.bathurst.nsw.gov.au',
  baseUrl: 'https://maps.bathurst.nsw.gov.au',
  instance: 'IntraMaps23A',
  project: '00000000-0000-0000-0000-000000000000',
  liteConfigId: '24d1884e-fc58-45df-bca0-11bddc554781',
  moduleId: 'aa22688c-60ba-4db6-8db1-60f89ba2c5ed',
  bins: [
    { field: 'Waste Collection Day', type: 'general', name: 'General waste', everyDays: 7 },
    { field: 'Recycling', type: 'recycling', name: 'Recycling', everyDays: 14 },
    { field: 'Organic', type: 'organics', name: 'Organics', everyDays: 7 },
  ],
});
