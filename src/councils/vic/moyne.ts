import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Moyne Shire Council, which runs on OpenCities. */
export const moyne = createOpenCitiesCouncil({
  id: 'vic/moyne',
  name: 'Moyne Shire Council',
  state: 'VIC',
  lgaCodes: ['25490'],
  timezone: 'Australia/Melbourne',
  baseUrl: 'https://www.moyne.vic.gov.au',
});
