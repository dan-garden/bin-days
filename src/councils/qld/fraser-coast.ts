import { createIntraMapsCouncil } from '../../platforms/intramaps.js';

/** Fraser Coast Regional Council, through its IntraMaps property map. */
export const fraserCoast = createIntraMapsCouncil({
  id: 'qld/fraser-coast',
  name: 'Fraser Coast Regional Council',
  state: 'QLD',
  lgaCodes: ['33220'],
  timezone: 'Australia/Brisbane',
  website: 'https://www.frasercoast.qld.gov.au',
  baseUrl: 'https://fcrc.spatial.t1cloud.com',
  instance: 'spatial/IntraMaps',
  project: '95d8904e-e9ef-4cac-88b5-def885f74f4d',
  configId: 'e003842b-3af0-44a7-8bd8-45f9880f2c30',
  liteConfigId: '3727d4c0-1e2e-4eff-9669-b89f3a1919fe',
  moduleId: 'b4b2af30-9b10-41a9-b9c9-3e253e2563a1',
  selectionLayerFilter: '93ccc583-6119-435f-845e-33deae245002',
  bins: [
    { field: 'Bin Day', type: 'general', name: 'General waste', everyDays: 7 },
    { field: 'Recycling Day', type: 'recycling', name: 'Recycling', everyDays: 14 },
  ],
});
