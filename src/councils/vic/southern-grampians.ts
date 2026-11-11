import { createZoneFileCouncil } from '../../platforms/zone-file.js';

/**
 * Southern Grampians Shire Council, whose map's zone file gives each bin's next date. The
 * organics bin is weekly for part of the year and fortnightly for the rest, so only its next
 * date is given.
 */
export const southernGrampians = createZoneFileCouncil({
  id: 'vic/southern-grampians',
  name: 'Southern Grampians Shire Council',
  state: 'VIC',
  lgaCodes: ['26260'],
  timezone: 'Australia/Melbourne',
  website: 'https://www.sthgrampians.vic.gov.au',
  fileUrl:
    'https://connect.pozi.com/userdata/southerngrampians-publisher/Public/Bin_Collection_Areas.json',
  bins: [
    { type: 'general', name: 'General waste', dateField: 'nextwaste', everyDays: 7 },
    { type: 'recycling', name: 'Recycling', dateField: 'nextrecyc', everyDays: 14 },
    { type: 'organics', name: 'Organics', dateField: 'nextgreen' },
  ],
});
