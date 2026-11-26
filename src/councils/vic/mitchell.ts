import { createZoneFileCouncil } from '../../platforms/zone-file.js';

/**
 * Mitchell Shire Council, from the zone file behind the council's community map. The council's
 * own website refuses our requests, so these dates couldn't be checked against its calendar.
 */
export const mitchell = createZoneFileCouncil({
  id: 'vic/mitchell',
  name: 'Mitchell Shire Council',
  state: 'VIC',
  lgaCodes: ['24850'],
  timezone: 'Australia/Melbourne',
  website: 'https://www.mitchellshire.vic.gov.au',
  fileUrl:
    'https://s3-ap-southeast-2.amazonaws.com/connect.pozi.com/userdata/mitchell/public/GarbageCollectionZones.geojson',
});
