import { createIntraMapsCouncil } from '../../platforms/intramaps.js';

/** City of Kwinana, through its IntraMaps property map. */
export const kwinana = createIntraMapsCouncil({
  id: 'wa/kwinana',
  name: 'City of Kwinana',
  state: 'WA',
  lgaCodes: ['54830'],
  timezone: 'Australia/Perth',
  website: 'https://www.kwinana.wa.gov.au',
  baseUrl: 'https://kwinana.spatial.t1cloud.com',
  instance: 'spatial/intramaps',
  project: '139a0e2d-fa83-4232-86e9-5e29f342e289',
  configId: '361cf79c-756a-4c28-903a-a8ed0347cacb',
  liteConfigId: '96651193-ca0f-4797-95d7-98e972248fad',
  moduleId: 'cbd33a46-14e5-4ca2-9009-03a51dcbc889',
  selectionLayerFilter: 'c6352192-20e8-402c-85c1-ca8515d3cae3',
  bins: [
    { field: 'Rubbish Collection', type: 'general', name: 'General waste' },
    { field: 'Recycle Collection', type: 'recycling', name: 'Recycling', everyDays: 14 },
    { field: 'Garden Organics Collection', type: 'organics', name: 'Garden organics' },
  ],
});
