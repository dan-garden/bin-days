import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Macedon Ranges Shire Council, which runs on OpenCities. */
export const macedonRanges = createOpenCitiesCouncil({
  id: 'vic/macedon-ranges',
  name: 'Macedon Ranges Shire Council',
  state: 'VIC',
  lgaCodes: ['24130'],
  timezone: 'Australia/Melbourne',
  baseUrl: 'https://www.mrsc.vic.gov.au',
});
