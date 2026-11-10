import { createArcGisZonesCouncil } from '../../platforms/arcgis-zones.js';

/** City of Launceston, whose collection zones carry each bin's next date. */
export const launceston = createArcGisZonesCouncil({
  id: 'tas/launceston',
  name: 'City of Launceston',
  state: 'TAS',
  lgaCodes: ['64010'],
  timezone: 'Australia/Hobart',
  website: 'https://www.launceston.tas.gov.au',
  layerUrl:
    'https://services.arcgis.com/yeXpdyjk3azbqItW/arcgis/rest/services/Waste/FeatureServer/0',
  bins: [
    { type: 'general', name: 'General waste', dateField: 'Garbagedate', everyDays: 7 },
    { type: 'recycling', name: 'Recycling', dateField: 'Recycledate', everyDays: 14 },
    { type: 'organics', name: 'Food and garden organics', dateField: 'Fogodate', everyDays: 14 },
    { type: 'bulky', name: 'Hard waste', dateField: 'Hardwastedate' },
  ],
});
