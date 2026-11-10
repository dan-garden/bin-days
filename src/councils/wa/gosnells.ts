import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** City of Gosnells, which runs on OpenCities. */
export const gosnells = createOpenCitiesCouncil({
  id: 'wa/gosnells',
  name: 'City of Gosnells',
  state: 'WA',
  lgaCodes: ['53780'],
  timezone: 'Australia/Perth',
  baseUrl: 'https://www.gosnells.wa.gov.au',
});
