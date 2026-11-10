import { createIntraMapsCouncil } from '../../platforms/intramaps.js';

/** City of Rockingham, through its IntraMaps property map. */
export const rockingham = createIntraMapsCouncil({
  id: 'wa/rockingham',
  name: 'City of Rockingham',
  state: 'WA',
  lgaCodes: ['57490'],
  timezone: 'Australia/Perth',
  website: 'https://rockingham.wa.gov.au',
  baseUrl: 'https://maps.rockingham.wa.gov.au',
  instance: 'IntraMaps23A',
  project: '1917ad36-6a1d-4145-9eeb-736f8fa9646d',
  bins: [
    { field: 'Waste (Red Lid)', type: 'general', name: 'General waste' },
    { field: 'Recycle (Yellow Lid)', type: 'recycling', name: 'Recycling' },
    { field: 'FOGO Bin (FOGO lid)', type: 'organics', name: 'Food and garden organics' },
  ],
});
