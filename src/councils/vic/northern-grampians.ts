import { parseDateNear } from '../../core/date.js';
import { addressNotFound, invalidInput } from '../../core/errors.js';
import { binService } from '../../core/schedule.js';
import type { BinService } from '../../core/types.js';
import { queryPoziLayer } from '../../platforms/pozi.js';
import type { CouncilAdapter } from '../types.js';

/**
 * Northern Grampians Shire Council, from the collection areas on its community
 * map. An area is found by the property's coordinates, so it needs a geocoded
 * address. St Arnaud's food and garden bin is not on the map and is left out.
 */
const BINS = [
  // The field's name really does end in a space.
  { field: 'Next_Rubbish_Pickup ', type: 'general', name: 'General rubbish', everyDays: 7 },
  { field: 'Next_Recycling_Pickup', type: 'recycling', name: 'Recycling', everyDays: 14 },
] as const;

export const northernGrampians: CouncilAdapter = {
  id: 'vic/northern-grampians',
  name: 'Northern Grampians Shire Council',
  state: 'VIC',
  lgaCodes: ['25810'],
  timezone: 'Australia/Melbourne',
  website: 'https://www.ngshire.vic.gov.au',
  platform: 'pozi',
  async getSchedule(address, { http, today }) {
    const { latitude, longitude } = address;
    if (latitude == null || longitude == null) {
      throw invalidInput(`${this.name} lookups need an address that can be located on a map`);
    }
    const near = [longitude - 1e-4, latitude - 1e-4, longitude + 1e-4, latitude + 1e-4];
    const { features, url } = await queryPoziLayer(
      http,
      'northerngrampians',
      'public',
      'Waste_Collection_Days',
      { BBOX: `${near.join(',')},EPSG:4326` },
    );
    const services: BinService[] = [];
    for (const bin of BINS) {
      // "Wednesday 18 November", with no year.
      const date = parseDateNear(String(features[0]?.[bin.field] ?? ''), today);
      if (date) services.push(binService(bin.type, bin.name, date, bin.everyDays));
    }
    if (!services.length) {
      throw addressNotFound(`${this.name} has no kerbside collection zone at "${address.input}"`);
    }
    return { matchedAddress: address.formatted ?? address.input, services, sourceUrl: url };
  },
};
