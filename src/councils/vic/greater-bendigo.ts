import { createZoneFileCouncil } from '../../platforms/zone-file.js';

/** City of Greater Bendigo, whose map's zone file gives each bin's next date. Every zone has the same cycles. */
export const greaterBendigo = createZoneFileCouncil({
  id: 'vic/greater-bendigo',
  name: 'City of Greater Bendigo',
  state: 'VIC',
  lgaCodes: ['22620'],
  timezone: 'Australia/Melbourne',
  website: 'https://www.bendigo.vic.gov.au',
  fileUrl:
    'https://connect.pozi.com/userdata/bendigo-publisher/Pozi_Public_City_of_Greater_Bendigo/Waste_Collection_Zones.json',
  bins: [
    {
      type: 'general',
      name: 'General waste',
      dateField: 'Next General Waste Pickup',
      everyDays: 14,
    },
    { type: 'recycling', name: 'Recycling', dateField: 'Next Recycling Pickup', everyDays: 14 },
    { type: 'organics', name: 'Organics', dateField: 'Next Organics Pickup', everyDays: 7 },
  ],
});
