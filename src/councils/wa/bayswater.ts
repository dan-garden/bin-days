import { createIntraMapsCouncil } from '../../platforms/intramaps.js';

/** City of Bayswater, through its IntraMaps property map. */
export const bayswater = createIntraMapsCouncil({
  id: 'wa/bayswater',
  name: 'City of Bayswater',
  state: 'WA',
  lgaCodes: ['50420'],
  timezone: 'Australia/Perth',
  website: 'https://www.bayswater.wa.gov.au',
  baseUrl: 'https://bayswater.spatial.t1cloud.com',
  instance: 'spatial/intramaps',
  project: '3c55e04f-d94e-4735-aecf-2e62b40bfd52',
  configId: '359e0f03-92e0-4309-9024-f199f434a742',
  liteConfigId: '221746d2-92cc-4591-a2da-bbecd930bb1b',
  moduleId: 'd1e90488-605a-43ad-88cd-793e0a7d7c4e',
  bins: [
    { field: 'Waste Red Lid', type: 'general', name: 'General waste' },
    { field: 'Recycling Yellow Lid', type: 'recycling', name: 'Recycling', everyDays: 14 },
    { field: 'FOGO Green Lid', type: 'organics', name: 'Food and garden organics' },
  ],
});
