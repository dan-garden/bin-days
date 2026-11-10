import { createIntraMapsCouncil } from '../../platforms/intramaps.js';

/** City of Kalamunda, through its IntraMaps property map. Each field's name gives the bin's cycle. */
export const kalamunda = createIntraMapsCouncil({
  id: 'wa/kalamunda',
  name: 'City of Kalamunda',
  state: 'WA',
  lgaCodes: ['54200'],
  timezone: 'Australia/Perth',
  website: 'https://www.kalamunda.wa.gov.au/kerbside-3-bin-system/collection-days/bin-day',
  baseUrl: 'https://kalamunda.spatial.t1cloud.com',
  instance: 'spatial/intramaps',
  project: 'd44a7973-329f-4626-9e09-35afeacc8724',
  configId: '38999f30-1676-4524-b501-0130581a2ba2',
  bins: [
    {
      field: 'Lime Green Lid Bin ( Green Waste FOGO ) : Every Week',
      type: 'organics',
      name: 'Food and garden organics',
      everyDays: 7,
    },
    {
      field: 'Yellow Lid Bin ( Recycling ) : Alternate Fortnight',
      type: 'recycling',
      name: 'Recycling',
      everyDays: 14,
    },
    {
      field: 'Red Lid Bin ( General Waste ) : Alternate Fortnight',
      type: 'general',
      name: 'General waste',
      everyDays: 14,
    },
  ],
});
