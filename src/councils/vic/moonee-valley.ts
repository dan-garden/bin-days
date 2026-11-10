import { createArcGisZonesCouncil } from '../../platforms/arcgis-zones.js';

/**
 * Moonee Valley City Council, whose list of properties carries each one's
 * weekday and the dates its fortnightly bins started. The cycles are those of
 * the council's own public map: landfill weekly, the other two fortnightly.
 */
export const mooneeValley = createArcGisZonesCouncil({
  id: 'vic/moonee-valley',
  name: 'Moonee Valley City Council',
  state: 'VIC',
  lgaCodes: ['25060'],
  timezone: 'Australia/Melbourne',
  website: 'https://mvcc.vic.gov.au',
  layerUrl:
    'https://services8.arcgis.com/Qhxu8dzT7BHYuJZL/arcgis/rest/services/BinCollection_add/FeatureServer/0',
  addressField: 'EZI_ADDRES',
  bins: [
    { type: 'general', name: 'General waste', dayField: 'collectday', everyDays: 7 },
    { type: 'recycling', name: 'Recycling', dateField: 'recy_stdat', everyDays: 14 },
    { type: 'organics', name: 'Food and garden organics', dateField: 'green_st_d', everyDays: 14 },
  ],
});
