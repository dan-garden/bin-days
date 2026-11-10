import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Logan City Council, which runs on OpenCities. */
export const logan = createOpenCitiesCouncil({
  id: 'qld/logan',
  name: 'Logan City Council',
  state: 'QLD',
  lgaCodes: ['34590'],
  timezone: 'Australia/Brisbane',
  baseUrl: 'https://www.logan.qld.gov.au',
});
