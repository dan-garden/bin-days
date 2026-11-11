import { createZoneFileCouncil } from '../../platforms/zone-file.js';

/** Glen Eira City Council, from the zone file behind the council's map. */
export const glenEira = createZoneFileCouncil({
  id: 'vic/glen-eira',
  name: 'Glen Eira City Council',
  state: 'VIC',
  lgaCodes: ['22310'],
  timezone: 'Australia/Melbourne',
  website: 'https://www.gleneira.vic.gov.au',
  fileUrl:
    'https://connect.pozi.com/userdata/gleneira-publisher/Council-Facilities-and-Services/Residential_Bin_Collection.json',
});
