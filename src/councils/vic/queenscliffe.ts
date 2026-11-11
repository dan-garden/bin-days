import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Borough of Queenscliffe, which runs on OpenCities. */
export const queenscliffe = createOpenCitiesCouncil({
  id: 'vic/queenscliffe',
  name: 'Borough of Queenscliffe',
  state: 'VIC',
  lgaCodes: ['26080'],
  timezone: 'Australia/Melbourne',
  baseUrl: 'https://www.queenscliffe.vic.gov.au',
});
