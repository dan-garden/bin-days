import { createIntraMapsCouncil } from '../../platforms/intramaps.js';

/** City of Mandurah, through its IntraMaps property map. */
export const mandurah = createIntraMapsCouncil({
  id: 'wa/mandurah',
  name: 'City of Mandurah',
  state: 'WA',
  lgaCodes: ['55110'],
  timezone: 'Australia/Perth',
  website: 'https://www.mandurah.wa.gov.au',
  baseUrl: 'https://maps.mandurah.wa.gov.au',
  instance: 'IntraMaps910',
  project: 'a510900b-e9b6-48e2-a541-8f4ea5bc2214',
  liteConfigId: 'e7feb691-ab8c-40e9-a7ab-bd73b298b789',
  moduleId: '8e8074e1-317a-4de0-ac28-4d9739285994',
  bins: [
    { field: 'Refuse Day', type: 'general', name: 'General waste', everyDays: 7 },
    { field: 'Next Recycle Day is ', type: 'recycling', name: 'Recycling', everyDays: 14 },
  ],
});
