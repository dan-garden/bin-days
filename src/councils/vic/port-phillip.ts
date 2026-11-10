import { createIntraMapsCouncil } from '../../platforms/intramaps.js';

/** City of Port Phillip, through its IntraMaps property map. */
export const portPhillip = createIntraMapsCouncil({
  id: 'vic/port-phillip',
  name: 'City of Port Phillip',
  state: 'VIC',
  lgaCodes: ['25900'],
  timezone: 'Australia/Melbourne',
  website: 'https://www.portphillip.vic.gov.au',
  baseUrl: 'https://copp.spatial.t1cloud.com',
  instance: 'spatial/IntraMaps',
  project: '3bf491de-10d3-42f0-be95-716bd4263526',
  configId: '15f21a6e-3939-4b70-b531-21309d0624de',
  liteConfigId: 'b0b09c2e-b120-4a07-84f3-fd8c1dbecb6e',
  moduleId: 'e948c801-51b4-452a-87b5-2627e0e3e01a',
  selectionLayerFilter: 'a6b80f49-ccbc-4b7c-8560-c1c15ac6164c',
  bins: [
    { field: 'Bin Collection', type: 'general', name: 'General waste', everyDays: 7 },
    { field: 'Bin Collection', type: 'recycling', name: 'Recycling', everyDays: 7 },
  ],
});
