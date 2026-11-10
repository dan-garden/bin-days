import { createArcGisZonesCouncil } from '../../platforms/arcgis-zones.js';

/** Cardinia Shire Council, whose collection zones carry each bin's start date and cycle. */
export const cardinia = createArcGisZonesCouncil({
  id: 'vic/cardinia',
  name: 'Cardinia Shire Council',
  state: 'VIC',
  lgaCodes: ['21450'],
  timezone: 'Australia/Melbourne',
  website: 'https://www.cardinia.vic.gov.au',
  layerUrl:
    'https://services3.arcgis.com/TJxZpUnYIJOvcYwE/arcgis/rest/services/Waste_Collection_Zones/FeatureServer/0',
  bins: [
    { type: 'general', name: 'General waste', dateField: 'rub_start', weeksField: 'rub_weeks' },
    { type: 'recycling', name: 'Recycling', dateField: 'rec_start', weeksField: 'rec_weeks' },
    { type: 'organics', name: 'Green waste', dateField: 'grn_start', weeksField: 'grn_weeks' },
  ],
});
