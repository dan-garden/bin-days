import { createIntraMapsCouncil } from '../../platforms/intramaps.js';

/** Shire of Serpentine Jarrahdale, through its IntraMaps property map. */
export const serpentineJarrahdale = createIntraMapsCouncil({
  id: 'wa/serpentine-jarrahdale',
  name: 'Shire of Serpentine Jarrahdale',
  state: 'WA',
  lgaCodes: ['57700'],
  timezone: 'Australia/Perth',
  website: 'https://www.sjshire.wa.gov.au',
  baseUrl: 'https://ser.spatial.t1cloud.com',
  instance: 'spatial/intramaps',
  project: '2e3adc22-b61d-4548-92d1-c1b02f9a30a3',
  configId: '93074f9e-ef2a-49d5-9866-91422949b9da',
  moduleId: 'bd33efd3-682b-478f-9dd1-82bdad11b52d',
  bins: [
    { field: 'Waste Collection Day', type: 'general', name: 'General waste', everyDays: 7 },
    { field: 'Recycle Day', type: 'recycling', name: 'Recycling', everyDays: 14 },
  ],
});
