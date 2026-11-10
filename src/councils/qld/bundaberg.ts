import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Bundaberg Regional Council, which runs on OpenCities. */
export const bundaberg = createOpenCitiesCouncil({
  id: 'qld/bundaberg',
  name: 'Bundaberg Regional Council',
  state: 'QLD',
  lgaCodes: ['31820'],
  timezone: 'Australia/Brisbane',
  baseUrl: 'https://www.bundaberg.qld.gov.au',
});
