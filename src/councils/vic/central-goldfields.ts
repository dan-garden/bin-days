import { createZoneFileCouncil } from '../../platforms/zone-file.js';

/**
 * Central Goldfields Shire Council, from the open dataset its own map reads.
 * The optional green bin (first and third Friday of the month) has no dates in it and is left out.
 */
export const centralGoldfields = createZoneFileCouncil({
  id: 'vic/central-goldfields',
  name: 'Central Goldfields Shire Council',
  state: 'VIC',
  lgaCodes: ['21670'],
  timezone: 'Australia/Melbourne',
  website: 'https://www.centralgoldfields.vic.gov.au',
  fileUrl:
    'https://data.gov.au/data/dataset/38968a77-fcfb-46a3-b24e-3200868ad632/resource/7215df9c-4480-4754-96d9-ba2c3173aa3d/download/central-goldfields-shire-garbage-collection-zones.json',
});
