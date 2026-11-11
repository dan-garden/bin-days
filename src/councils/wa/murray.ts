import { pickAddress, searchLine } from '../../core/address.js';
import { classifyBin } from '../../core/bin-types.js';
import { isLocalDate } from '../../core/date.js';
import { parseError } from '../../core/errors.js';
import { getJson } from '../../core/http.js';
import { binService } from '../../core/schedule.js';
import type { BinService } from '../../core/types.js';
import type { CouncilAdapter } from '../types.js';

/**
 * Shire of Murray, via the two calls behind its bins page: one finds the
 * property, the other returns each bin's next date and its cycle in days.
 */
const API = 'https://www.murray.wa.gov.au/api/cms/v1/wastecollection';

interface Property {
  Guid: string;
  /** "12 Example Road, North Yunderup" */
  Address: string;
}

interface Details {
  CollectionData?: Array<{
    BinType: { Name: string };
    /** The cycle in days. Zero for a one-off verge collection, which isn't a bin. */
    Interval: number;
    NextCollectionDate: string;
  }>;
}

export const murray: CouncilAdapter = {
  id: 'wa/murray',
  name: 'Shire of Murray',
  state: 'WA',
  lgaCodes: ['56230'],
  timezone: 'Australia/Perth',
  website: 'https://www.murray.wa.gov.au',
  platform: 'council-api',
  async getSchedule(address, { http }) {
    const search = `${API}/GetAddressesByQuery?${new URLSearchParams({
      addressQuery: searchLine(address, this.name, { includeUnit: true }),
    })}`;
    const results = await getJson<Property[]>(http, search);
    const property = pickAddress(results, (r) => r.Address, address, this.name);

    const url = `${API}/GetAddressDetailsByGuid?${new URLSearchParams({ id: property.Guid })}`;
    const { CollectionData = [] } = await getJson<Details>(http, url);
    const services: BinService[] = [];
    for (const { BinType, Interval, NextCollectionDate } of CollectionData) {
      const date = NextCollectionDate.slice(0, 10);
      if (Interval > 0 && isLocalDate(date)) {
        services.push(binService(classifyBin(BinType.Name), BinType.Name, date, Interval));
      }
    }
    if (!services.length)
      throw parseError(`No bin services found for ${property.Address}`, { url });
    return { matchedAddress: property.Address, services, sourceUrl: url };
  },
};
