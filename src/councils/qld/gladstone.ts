import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Gladstone Regional Council, which runs on OpenCities. */
export const gladstone = createOpenCitiesCouncil({
  id: 'qld/gladstone',
  name: 'Gladstone Regional Council',
  state: 'QLD',
  lgaCodes: ['33360'],
  timezone: 'Australia/Brisbane',
  baseUrl: 'https://www.gladstone.qld.gov.au',
});
