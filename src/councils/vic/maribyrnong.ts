import { createWasteInfoCouncil } from '../../platforms/waste-info.js';

/** Maribyrnong City Council, on waste-info.com.au. */
export const maribyrnong = createWasteInfoCouncil({
  id: 'vic/maribyrnong',
  name: 'Maribyrnong City Council',
  state: 'VIC',
  lgaCodes: ['24330'],
  timezone: 'Australia/Melbourne',
  subdomain: 'maribyrnong',
});
