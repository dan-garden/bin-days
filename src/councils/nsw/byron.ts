import { createArcGisZonesCouncil } from '../../platforms/arcgis-zones.js';

/**
 * Byron Shire Council, from its public map of roads, each with its bin day and its area: North,
 * South, or none for rural roads. The map has no dates, so which fortnight each area's bins go
 * comes from the council's 2026-27 calendars: in the North and rural areas, general waste goes
 * in the week of 9 November 2026 and recycling the week after; the South is the other way round.
 * The calendars run to July 2027, so check them again then. The map was last edited in 2021.
 */
const NORTH_WASTE = '2026-11-09';
const SOUTH_WASTE = '2026-11-16';

export const byron = createArcGisZonesCouncil({
  id: 'nsw/byron',
  name: 'Byron Shire Council',
  state: 'NSW',
  lgaCodes: ['11350'],
  timezone: 'Australia/Sydney',
  website: 'https://www.byron.nsw.gov.au',
  layerUrl:
    'https://services7.arcgis.com/SqbRuGmmUbhRpdi1/arcgis/rest/services/Bin_Collection_Days/FeatureServer/0',
  // The layer is road centrelines, so look a house's width either side of the address.
  searchRadius: 40,
  weekField: 'Nth_Sth',
  bins: [
    {
      type: 'general',
      name: 'Landfill',
      dayField: 'BINDAY',
      weekOf: { North: NORTH_WASTE, South: SOUTH_WASTE, null: NORTH_WASTE },
      everyDays: 14,
    },
    {
      type: 'recycling',
      name: 'Recycling',
      dayField: 'BINDAY',
      weekOf: { North: SOUTH_WASTE, South: NORTH_WASTE, null: SOUTH_WASTE },
      everyDays: 14,
    },
    {
      type: 'organics',
      name: 'Organics',
      dayField: 'BINDAY',
      everyDays: 7,
      onlyWhere: { CLASS: 'Urban' },
    },
  ],
});
