import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** City of Moreton Bay, which runs on OpenCities. */
export const moretonBay = createOpenCitiesCouncil({
  id: 'qld/moreton-bay',
  name: 'City of Moreton Bay',
  state: 'QLD',
  lgaCodes: ['35010'],
  timezone: 'Australia/Brisbane',
  baseUrl: 'https://www.moretonbay.qld.gov.au',
});
