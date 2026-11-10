import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Cassowary Coast Regional Council, which runs on OpenCities. */
export const cassowaryCoast = createOpenCitiesCouncil({
  id: 'qld/cassowary-coast',
  name: 'Cassowary Coast Regional Council',
  state: 'QLD',
  lgaCodes: ['32260'],
  timezone: 'Australia/Brisbane',
  baseUrl: 'https://www.cassowarycoast.qld.gov.au',
});
