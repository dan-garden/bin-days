import { createZoneFileCouncil } from '../../platforms/zone-file.js';

/**
 * Latrobe City Council, from the zone file behind the council's community map. The council's
 * own website refuses our requests, so these dates couldn't be checked against its calendar.
 */
export const latrobe = createZoneFileCouncil({
  id: 'vic/latrobe',
  name: 'Latrobe City Council',
  state: 'VIC',
  lgaCodes: ['23810'],
  timezone: 'Australia/Melbourne',
  website: 'https://www.latrobe.vic.gov.au',
  fileUrl:
    'https://connect.pozi.com/userdata/latrobe/public/lcc_council_services_garbage_collection_zones.json',
});
