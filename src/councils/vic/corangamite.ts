import { addDays, daysBetween } from '../../core/date.js';
import { parseError } from '../../core/errors.js';
import { expandRecurrence } from '../../core/schedule.js';
import { findZone } from '../../platforms/zone-file.js';
import { OPEN_COUNCIL_BINS, zoneServices } from '../../platforms/zones.js';
import type { CouncilAdapter } from '../types.js';

/**
 * Corangamite Shire Council, from the collection zones it publishes as open data.
 * The glass bin (the first full recycling week of each month) is not in it and is left out.
 */
const FILE =
  'https://data.gov.au/data/dataset/eeebd4a3-8441-475c-9b45-343efc54c3fa/resource/3153e76b-91da-4af5-993a-8ba50dfe4ae5/download/corangamite-shire-garbage-collection-zones.json';

export const corangamite: CouncilAdapter = {
  id: 'vic/corangamite',
  name: 'Corangamite Shire Council',
  state: 'VIC',
  lgaCodes: ['21830'],
  timezone: 'Australia/Melbourne',
  website: 'https://www.corangamite.vic.gov.au',
  platform: 'zone-file',
  async getSchedule(address, { http, today }) {
    const zone = await findZone(http, FILE, address, this.name);
    const services = zoneServices(OPEN_COUNCIL_BINS, zone, today).filter((s) => s.type !== 'glass');
    if (!services.length) throw parseError(`No bin services found for ${this.name}`, { url: FILE });

    // The green bin is fortnightly from January to September and weekly from October to
    // December (the dataset's own note, and the council's calendar), so its dates are listed.
    for (const service of services) {
      const { recurrence } = service;
      if (service.type !== 'organics' || recurrence.kind !== 'interval') continue;
      const weekly = expandRecurrence({ ...recurrence, everyDays: 7 }, today, addDays(today, 365));
      service.recurrence = {
        kind: 'dates',
        dates: weekly.filter(
          (date) =>
            Number(date.slice(5, 7)) >= 10 ||
            daysBetween(recurrence.anchor, date) % recurrence.everyDays === 0,
        ),
      };
    }
    return { matchedAddress: address.formatted ?? address.input, services, sourceUrl: FILE };
  },
};
