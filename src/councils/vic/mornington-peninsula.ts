import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** Mornington Peninsula Shire Council, which runs on OpenCities. */
export const morningtonPeninsula = createOpenCitiesCouncil({
  id: 'vic/mornington-peninsula',
  name: 'Mornington Peninsula Shire Council',
  state: 'VIC',
  lgaCodes: ['25340'],
  timezone: 'Australia/Melbourne',
  baseUrl: 'https://www.mornpen.vic.gov.au',
});
