import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Strathfield Council, which runs on OpenCities. */
export const strathfield = createOpenCitiesCouncil({
  id: 'nsw/strathfield',
  name: 'Strathfield Council',
  state: 'NSW',
  lgaCodes: ['17100'],
  timezone: 'Australia/Sydney',
  baseUrl: 'https://www.strathfield.nsw.gov.au',
});
