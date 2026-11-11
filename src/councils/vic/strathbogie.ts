import { createZoneFileCouncil } from '../../platforms/zone-file.js';

/**
 * Strathbogie Shire Council, from the collection zones it publishes as open data.
 * The council publishes a new dataset each financial year, so this address changes each July.
 */
export const strathbogie = createZoneFileCouncil({
  id: 'vic/strathbogie',
  name: 'Strathbogie Shire Council',
  state: 'VIC',
  lgaCodes: ['26430'],
  timezone: 'Australia/Melbourne',
  website: 'https://www.strathbogie.vic.gov.au',
  fileUrl:
    'https://data.gov.au/data/dataset/aa288585-421f-4667-963b-2ee72f03249d/resource/8b69c6a1-d9e0-40fd-bddb-98c66cb4cdb5/download/ssc_wastecollectionzones_2026_27_region.geojson',
});
