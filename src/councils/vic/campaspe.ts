import { createIntraMapsCouncil } from '../../platforms/intramaps.js';

/**
 * Campaspe Shire Council, through its IntraMaps property map. The map gives each bin's next date
 * but not how often it goes, so only that date is shown.
 */
export const campaspe = createIntraMapsCouncil({
  id: 'vic/campaspe',
  name: 'Campaspe Shire Council',
  state: 'VIC',
  lgaCodes: ['21370'],
  timezone: 'Australia/Melbourne',
  website: 'https://www.campaspe.vic.gov.au',
  baseUrl: 'https://campaspe.spatial.t1cloud.com',
  instance: 'spatial/IntraMaps',
  project: '',
  configId: '9d473bd9-fbfa-4258-a7fd-297b913b135f',
  liteConfigId: 'ca2d5b3c-5654-4055-87a5-243521716da4',
  moduleId: 'e5f19215-a557-4d7b-9908-ecf377a3cd73',
  bins: [
    { field: 'Next Waste Collection', type: 'general', name: 'General waste' },
    { field: 'Next Recycle Collection', type: 'recycling', name: 'Recycling' },
    { field: 'Next Organics Collection', type: 'organics', name: 'Food and garden organics' },
  ],
});
