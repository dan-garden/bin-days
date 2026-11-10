import { createWasteInfoCouncil } from '../../platforms/waste-info.js';

/** Queanbeyan-Palerang Regional Council, on waste-info.com.au. */
export const queanbeyanPalerang = createWasteInfoCouncil({
  id: 'nsw/queanbeyan-palerang',
  name: 'Queanbeyan-Palerang Regional Council',
  state: 'NSW',
  lgaCodes: ['16490'],
  timezone: 'Australia/Sydney',
  subdomain: 'qprc',
});
