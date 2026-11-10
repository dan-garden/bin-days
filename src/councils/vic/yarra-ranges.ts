import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Yarra Ranges Shire Council, which runs on OpenCities. */
export const yarraRanges = createOpenCitiesCouncil({
  id: 'vic/yarra-ranges',
  name: 'Yarra Ranges Shire Council',
  state: 'VIC',
  lgaCodes: ['27450'],
  timezone: 'Australia/Melbourne',
  baseUrl: 'https://www.yarraranges.vic.gov.au',
});
