import { createIntraMapsCouncil } from '../../platforms/intramaps.js';

/** Bayside City Council, through its IntraMaps property map. */
export const baysideVic = createIntraMapsCouncil({
  id: 'vic/bayside',
  name: 'Bayside City Council',
  state: 'VIC',
  lgaCodes: ['20910'],
  timezone: 'Australia/Melbourne',
  website: 'https://www.bayside.vic.gov.au',
  baseUrl: 'https://gis.bayside.vic.gov.au',
  instance: 'IntraMaps910',
  project: '1c8f869f-fa4a-4c39-b7bb-94641ee61597',
  configId: '7a287c70-ea2d-4abd-943c-8bf55cf09fe5',
  moduleId: '5c590b56-e989-48a3-9bb8-207d4a388373',
  bins: [
    { field: 'Domestic Waste', type: 'general', name: 'General waste' },
    { field: 'Recycling', type: 'recycling', name: 'Recycling', everyDays: 14 },
    { field: 'Food & Green Waste', type: 'organics', name: 'Food and green waste' },
  ],
});
