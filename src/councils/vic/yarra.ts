import { createArcGisZonesCouncil } from '../../platforms/arcgis-zones.js';

/**
 * Yarra City Council, whose collection zones carry a weekday for the weekly
 * bins, a recycling date and a glass date. The zones for glass and for the
 * other bins are published joined, so each field's name starts with its table.
 */
const WASTE = 'internal.gdo.Waste_Recycle_FOGO_Collection_Zones';
const GLASS = 'internal.gdo.Glass_Collection_Zones';

export const yarra = createArcGisZonesCouncil({
  id: 'vic/yarra',
  name: 'Yarra City Council',
  state: 'VIC',
  lgaCodes: ['27350'],
  timezone: 'Australia/Melbourne',
  website: 'https://www.yarracity.vic.gov.au',
  layerUrl:
    'https://yccgis-prd.esriaustraliaonline.com.au/arcgis/rest/services/Waste_Services/CW_FC_PRD_Waste_Collection/MapServer/0',
  bins: [
    { type: 'general', name: 'General waste', dayField: `${WASTE}.collection_day`, everyDays: 7 },
    {
      type: 'organics',
      name: 'Food and garden organics',
      dayField: `${WASTE}.collection_day`,
      everyDays: 7,
    },
    {
      type: 'recycling',
      name: 'Recycling',
      dateField: `${WASTE}.recycling_anchor_date`,
      everyDays: 14,
    },
    { type: 'glass', name: 'Glass', dateField: `${GLASS}.anchor_date`, everyDays: 28 },
  ],
});
