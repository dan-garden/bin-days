import { createIntraMapsCouncil } from '../../platforms/intramaps.js';

/** City of Swan, through its IntraMaps property map. */
export const swan = createIntraMapsCouncil({
  id: 'wa/swan',
  name: 'City of Swan',
  state: 'WA',
  lgaCodes: ['58050'],
  timezone: 'Australia/Perth',
  website: 'https://www.swan.wa.gov.au',
  baseUrl: 'https://swan.spatial.t1cloud.com',
  instance: 'spatial/intramaps',
  project: '41a8ffbd-0da0-47c9-9957-b0dcb8a1bfc3',
  configId: '4c6eefa0-c035-40d1-b553-be6e06446b38',
  moduleId: '5a0205e5-ab05-4d94-a97f-2ae565ae48ff',
  selectionLayerFilter: 'efd1a218-d9c4-43ec-b1bb-17514d03c3a3',
  bins: [
    {
      field: 'Next General Waste Collection',
      type: 'general',
      name: 'General waste',
      everyDays: 7,
    },
    { field: 'Next Recycling Collection', type: 'recycling', name: 'Recycling', everyDays: 14 },
    { field: 'Next FOGO Collection', type: 'organics', name: 'Food and garden organics' },
  ],
});
