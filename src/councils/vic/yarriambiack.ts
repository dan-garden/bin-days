import { createZoneFileCouncil } from '../../platforms/zone-file.js';

/**
 * Yarriambiack Shire Council, from the zone file behind the council's community map. The file
 * dates from 2021; its weeks were checked against the council's 2026-27 calendar. The
 * shire-wide glass bin (every two months) is not in it and is left out.
 */
export const yarriambiack = createZoneFileCouncil({
  id: 'vic/yarriambiack',
  name: 'Yarriambiack Shire Council',
  state: 'VIC',
  lgaCodes: ['27630'],
  timezone: 'Australia/Melbourne',
  website: 'https://www.yarriambiack.vic.gov.au',
  fileUrl: 'https://connect.pozi.com/userdata/yarriambiack/public/ysc_assets_waste_routes.json',
});
