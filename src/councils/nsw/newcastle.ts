import { createArcGisZonesCouncil } from '../../platforms/arcgis-zones.js';

/**
 * City of Newcastle. Its zones give a weekday and a week (1 or 2). The weeks
 * are those of the formula in the council's own public map, which counts
 * fortnights from Monday 28 June 2021: recycling goes out in a zone's own
 * week, and garden organics in the other.
 */
const WEEK_1 = '2021-07-05';
const WEEK_2 = '2021-06-28';

export const newcastle = createArcGisZonesCouncil({
  id: 'nsw/newcastle',
  name: 'City of Newcastle',
  state: 'NSW',
  lgaCodes: ['15900'],
  timezone: 'Australia/Sydney',
  website: 'https://www.newcastle.nsw.gov.au/living/waste-and-recycling',
  layerUrl:
    'https://services-ap1.arcgis.com/CNeUPE1voVc22gNk/arcgis/rest/services/WasteCollectionDay/FeatureServer/0',
  weekField: 'WeekNo',
  bins: [
    { type: 'general', name: 'General waste', dayField: 'Day', everyDays: 7 },
    {
      type: 'recycling',
      name: 'Recycling',
      dayField: 'Day',
      weekOf: { 1: WEEK_1, 2: WEEK_2 },
      everyDays: 14,
    },
    {
      type: 'organics',
      name: 'Garden organics',
      dayField: 'Day',
      weekOf: { 1: WEEK_2, 2: WEEK_1 },
      everyDays: 14,
    },
  ],
});
