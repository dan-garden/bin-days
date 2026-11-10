import { createArcGisZonesCouncil } from '../../platforms/arcgis-zones.js';

/**
 * Town of Bassendean. Its list of properties gives a weekday only. The fortnights are those
 * of the formulas in the council's own "Find My Bin Day" map: general waste
 * counted from the week of 28 April 2025, recycling from the week before.
 */
export const bassendean = createArcGisZonesCouncil({
  id: 'wa/bassendean',
  name: 'Town of Bassendean',
  state: 'WA',
  lgaCodes: ['50350'],
  timezone: 'Australia/Perth',
  website: 'https://www.bassendean.wa.gov.au',
  layerUrl:
    'https://services-ap1.arcgis.com/551UnqKK1GZeDKxQ/arcgis/rest/services/address_lookup_for_bin_days_dissolved/FeatureServer/0',
  addressField: 'SL_Addy',
  bins: [
    { type: 'organics', name: 'Food and garden organics', dayField: 'ServiceDay', everyDays: 7 },
    {
      type: 'general',
      name: 'General waste',
      dayField: 'ServiceDay',
      weekOf: '2025-04-28',
      everyDays: 14,
    },
    {
      type: 'recycling',
      name: 'Recycling',
      dayField: 'ServiceDay',
      weekOf: '2025-04-21',
      everyDays: 14,
    },
  ],
});
