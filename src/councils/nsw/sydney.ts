import { formatStreetLine, matchesHouseNumber, preferSuburb } from '../../core/address.js';
import { classifyBin, DEFAULT_COLOURS } from '../../core/bin-types.js';
import { daysBetween, parseAustralianDate } from '../../core/date.js';
import { addressNotFound, invalidInput, parseError } from '../../core/errors.js';
import { getJson } from '../../core/http.js';
import type { BinService } from '../../core/types.js';
import type { CouncilAdapter } from '../types.js';

/**
 * City of Sydney, via the service behind the council's "find my bin
 * collection day" widget: one call finds the property, the other returns each
 * bin's next two collection dates.
 */
const API = 'https://cos-bin-collection-widget.netlify.app/api';

interface Match {
  propertyKey: number;
  /** e.g. `17 Junction Street, Forest Lodge` */
  fullAddress: string;
}

interface Bin {
  /** e.g. "Waste", "Recycling", "Green Waste" */
  roundDescription: string;
  /** e.g. "Tuesday 10/11/2026" */
  nextPickupDate?: string | null;
  pickupDateAfterNext?: string | null;
}

export const sydney: CouncilAdapter = {
  id: 'nsw/sydney',
  name: 'City of Sydney',
  state: 'NSW',
  lgaCodes: ['17200'],
  timezone: 'Australia/Sydney',
  website:
    'https://www.cityofsydney.nsw.gov.au/waste-recycling-services/find-my-bin-collection-day',
  platform: 'council-api',

  async getSchedule(address, { http }) {
    const { parts } = address;
    if (!parts.houseNumber || !parts.street) {
      throw invalidInput('City of Sydney lookups need a house number and street', { parts });
    }
    // The search matches on the street line alone; adding the suburb finds nothing.
    const term = formatStreetLine(parts, { includeUnit: true });
    const searchUrl = `${API}/search?address=${encodeURIComponent(term)}`;
    const { matchingProperties: matches } = await getJson<{ matchingProperties?: Match[] }>(
      http,
      searchUrl,
    );
    if (!Array.isArray(matches)) {
      throw parseError('Unexpected response from the City of Sydney', { url: searchUrl });
    }

    const candidates = preferSuburb(
      matches.filter((m) => matchesHouseNumber(m.fullAddress, parts)),
      (m) => m.fullAddress.split(',')[1]?.trim() ?? '',
      parts.suburb,
    );
    // A building and its units share the address; without a unit, take the building.
    const exact = candidates.filter((m) => !!parts.unit === m.fullAddress.includes('/'));
    const chosen = exact.length ? exact : candidates;
    const property = chosen[0];
    if (!property || new Set(chosen.map((m) => m.fullAddress)).size !== 1) {
      throw addressNotFound(`City of Sydney has no property matching "${address.input}"`, {
        suggestions: (chosen.length ? chosen : matches).slice(0, 5).map((m) => m.fullAddress),
      });
    }

    const url = `${API}/property/${property.propertyKey}/bins-collection`;
    const response = await http.fetch(url, { headers: { accept: 'application/json' } });
    // No content means the council has no kerbside schedule for it, as with many apartment blocks.
    const bins = response.status === 200 ? ((await response.json()) as { bins?: Bin[] }).bins : [];
    const services: BinService[] = [];
    for (const bin of bins ?? []) {
      const next = parseAustralianDate(bin.nextPickupDate ?? '');
      const after = parseAustralianDate(bin.pickupDateAfterNext ?? '');
      if (!next) continue;
      const type = classifyBin(bin.roundDescription);
      const colour = DEFAULT_COLOURS[type];
      services.push({
        type,
        name: bin.roundDescription,
        ...(colour ? { colour } : {}),
        // The gap between the two dates the council gives is the cycle.
        recurrence: after
          ? { kind: 'interval', everyDays: daysBetween(next, after), anchor: next }
          : { kind: 'dates', dates: [next] },
      });
    }
    if (!services.length) {
      throw addressNotFound(
        `City of Sydney has no kerbside collection listed for "${property.fullAddress}". Large buildings are often serviced separately.`,
      );
    }
    return { matchedAddress: property.fullAddress, services, sourceUrl: url };
  },
};
