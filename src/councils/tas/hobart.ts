import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** City of Hobart, which runs on OpenCities. */
export const hobart = createOpenCitiesCouncil({
  id: 'tas/hobart',
  name: 'City of Hobart',
  state: 'TAS',
  lgaCodes: ['62810'],
  timezone: 'Australia/Hobart',
  baseUrl: 'https://www.hobartcity.com.au',
});
