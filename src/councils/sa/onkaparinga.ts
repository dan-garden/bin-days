import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** City of Onkaparinga, which runs on OpenCities. */
export const onkaparinga = createOpenCitiesCouncil({
  id: 'sa/onkaparinga',
  name: 'City of Onkaparinga',
  state: 'SA',
  lgaCodes: ['45340'],
  timezone: 'Australia/Adelaide',
  baseUrl: 'https://www.onkaparingacity.com',
});
