import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** City of Whittlesea, which runs on OpenCities. */
export const whittlesea = createOpenCitiesCouncil({
  id: 'vic/whittlesea',
  name: 'City of Whittlesea',
  state: 'VIC',
  lgaCodes: ['27070'],
  timezone: 'Australia/Melbourne',
  baseUrl: 'https://www.whittlesea.vic.gov.au',
});
