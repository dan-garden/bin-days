import { createIntraMapsCouncil } from '../../platforms/intramaps.js';

/** City of South Perth, through its IntraMaps property map. */
export const southPerth = createIntraMapsCouncil({
  id: 'wa/south-perth',
  name: 'City of South Perth',
  state: 'WA',
  lgaCodes: ['57840'],
  timezone: 'Australia/Perth',
  website: 'https://southperth.wa.gov.au',
  baseUrl: 'https://cosp.spatial.t1cloud.com',
  instance: 'spatial/intramaps',
  project: 'cf285c38-0d67-406e-93c2-35ae3d066521',
  configId: '29b80b8c-2c27-4a14-8f10-678c7947f7be',
  bins: [
    { field: 'Waste Pickup Day', type: 'general', name: 'General waste' },
    { field: 'Next Recycling Pickup', type: 'recycling', name: 'Recycling', everyDays: 14 },
  ],
});
