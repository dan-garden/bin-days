import { createZoneFileCouncil } from '../../platforms/zone-file.js';

/**
 * Hindmarsh Shire Council, from the zone file behind the council's community map.
 * The shire-wide glass bin (every twelve weeks) is not in it and is left out.
 */
export const hindmarsh = createZoneFileCouncil({
  id: 'vic/hindmarsh',
  name: 'Hindmarsh Shire Council',
  state: 'VIC',
  lgaCodes: ['22980'],
  timezone: 'Australia/Melbourne',
  website: 'https://www.hindmarsh.vic.gov.au',
  fileUrl: 'https://config.pozi.com/public/files/hsc-garbage-collection-zones.json',
});
