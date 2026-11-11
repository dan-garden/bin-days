import { createZoneFileCouncil } from '../../platforms/zone-file.js';

/** Frankston City Council, from the zone file behind the council's bin day widget. */
export const frankston = createZoneFileCouncil({
  id: 'vic/frankston',
  name: 'Frankston City Council',
  state: 'VIC',
  lgaCodes: ['22170'],
  timezone: 'Australia/Melbourne',
  website: 'https://www.frankston.vic.gov.au',
  fileUrl:
    'https://connect.pozi.com/userdata/frankston-publisher/Community/Kerbside_Garbage_Collection_(Widget).json',
});
