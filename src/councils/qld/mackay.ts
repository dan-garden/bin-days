import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Mackay Regional Council, which runs on OpenCities. */
export const mackay = createOpenCitiesCouncil({
  id: 'qld/mackay',
  name: 'Mackay Regional Council',
  state: 'QLD',
  lgaCodes: ['34770'],
  timezone: 'Australia/Brisbane',
  baseUrl: 'https://www.mackay.qld.gov.au',
});
