import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Town of Cambridge, which runs on OpenCities. */
export const cambridge = createOpenCitiesCouncil({
  id: 'wa/cambridge',
  name: 'Town of Cambridge',
  state: 'WA',
  lgaCodes: ['51310'],
  timezone: 'Australia/Perth',
  baseUrl: 'https://www.cambridge.wa.gov.au',
});
