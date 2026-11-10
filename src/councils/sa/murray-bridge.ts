import { createMyLocalServicesCouncil } from '../../platforms/my-local-services.js';

/** Rural City of Murray Bridge, via South Australia's My Local Services. */
export const murrayBridge = createMyLocalServicesCouncil({
  id: 'sa/murray-bridge',
  name: 'Rural City of Murray Bridge',
  state: 'SA',
  lgaCodes: ['45040'],
  timezone: 'Australia/Adelaide',
  website: 'https://www.murraybridge.sa.gov.au',
});
