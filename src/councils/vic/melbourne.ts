import { addressNotFound, invalidInput, parseError } from '../../core/errors.js';
import { queryOpendatasoft } from '../../platforms/opendatasoft.js';
import { OPEN_COUNCIL_BINS, zoneServices } from '../../platforms/zones.js';
import type { CouncilAdapter } from '../types.js';

/**
 * City of Melbourne, from the collection zones on its open data portal. The dataset has
 * general waste and recycling only, and was last updated in 2021.
 */
const PORTAL = 'https://data.melbourne.vic.gov.au';
const DATASET = 'garbage-collection-zones';

export const melbourne: CouncilAdapter = {
  id: 'vic/melbourne',
  name: 'City of Melbourne',
  state: 'VIC',
  lgaCodes: ['24600'],
  timezone: 'Australia/Melbourne',
  website: 'https://www.melbourne.vic.gov.au',
  platform: 'opendatasoft',
  async getSchedule(address, { http, today }) {
    const { latitude, longitude } = address;
    if (latitude == null || longitude == null) {
      throw invalidInput(`${this.name} lookups need an address that can be located on a map`);
    }
    const { records, url } = await queryOpendatasoft(http, {
      portal: PORTAL,
      dataset: DATASET,
      where: `intersects(geo_shape, geom'POINT(${longitude} ${latitude})')`,
      limit: 1,
    });
    const [zone] = records;
    if (!zone) {
      throw addressNotFound(`${this.name} has no kerbside collection zone at "${address.input}"`);
    }
    const services = zoneServices(OPEN_COUNCIL_BINS, zone, today);
    if (!services.length) throw parseError(`No bin services found for ${this.name}`, { url });
    return { matchedAddress: address.formatted ?? address.input, services, sourceUrl: url };
  },
};
