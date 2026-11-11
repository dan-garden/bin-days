import { pickAddress, searchLine } from '../../core/address.js';
import { classifyBin } from '../../core/bin-types.js';
import { isLocalDate } from '../../core/date.js';
import { parseError } from '../../core/errors.js';
import { getJson } from '../../core/http.js';
import { binService } from '../../core/schedule.js';
import type { BinService } from '../../core/types.js';
import type { CouncilAdapter } from '../types.js';

/**
 * Glenorchy City Council, via the call behind its rubbish collection page: asked
 * with an address it finds the property, and asked with the property it returns
 * a past collection date and a cycle in days for each bin.
 */
const API = 'https://www.gcc.tas.gov.au/wp-json/v1/waste-collection';

interface Service {
  PID: number;
  /** "12 Example Street, Glenorchy  TAS  7010" */
  Address: string;
  ServiceType?: string;
  SeedDate?: string;
  Days?: number;
}

export const glenorchy: CouncilAdapter = {
  id: 'tas/glenorchy',
  name: 'Glenorchy City Council',
  state: 'TAS',
  lgaCodes: ['62610'],
  timezone: 'Australia/Hobart',
  website: 'https://www.gcc.tas.gov.au',
  platform: 'council-api',
  async getSchedule(address, { http }) {
    const ask = async (body: object) => {
      const answer = await getJson<{ features?: Array<{ properties: Service }> }>(http, API, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      return (answer.features ?? []).map((feature) => feature.properties);
    };
    const results = await ask({ address: searchLine(address, this.name, { includeUnit: true }) });
    const property = pickAddress(results, (r) => r.Address, address, this.name);

    const services: BinService[] = [];
    for (const { ServiceType, SeedDate = '', Days } of await ask({ pid: String(property.PID) })) {
      if (ServiceType && Days && isLocalDate(SeedDate)) {
        services.push(binService(classifyBin(ServiceType), ServiceType, SeedDate, Days));
      }
    }
    const matchedAddress = property.Address.replace(/\s+/g, ' ');
    if (!services.length)
      throw parseError(`No bin services found for ${matchedAddress}`, { url: API });
    return { matchedAddress, propertyId: String(property.PID), services, sourceUrl: API };
  },
};
