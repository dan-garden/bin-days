import { createOpenCitiesCouncil } from '../../platforms/opencities.js';

/** City of Gold Coast, which runs on OpenCities. */
export const goldCoast = createOpenCitiesCouncil({
  id: 'qld/gold-coast',
  name: 'City of Gold Coast',
  state: 'QLD',
  lgaCodes: ['33430'],
  timezone: 'Australia/Brisbane',
  website: 'https://www.goldcoast.qld.gov.au/Services/Waste-recycling/Find-my-bin-day',
  baseUrl: 'https://www.goldcoast.qld.gov.au',
  sessionPagePath: '/Services/Waste-recycling/Find-my-bin-day',
  // Gold Coast general waste bins have a red lid; green organics a lime lid.
  colours: { general: 'red', recycling: 'yellow', organics: 'lime' },
});
