import { formatStreetLine, matchesHouseNumber, preferSuburb } from '../../core/address.js';
import { nextWeekday, toLocalDate, weekdayInWeekOf } from '../../core/date.js';
import { addressNotFound, invalidInput, parseError } from '../../core/errors.js';
import { getJson, getText } from '../../core/http.js';
import { binService } from '../../core/schedule.js';
import type { CouncilAdapter } from '../types.js';

/**
 * Northern Beaches Council, via the two calls behind the council's bin
 * collection days page: one finds the property, the other names its calendar,
 * e.g. "FridayB" for Fridays in zone B.
 *
 * The council publishes the fortnights only as those calendars, so the weeks
 * below were read from them: paper recycling goes out in the week of 2
 * November 2026 and container recycling in the week after, everywhere. Zone A
 * puts vegetation out with containers, and zone B with paper.
 *
 * shortcut: read from the 2026 calendars; check the 2027 ones when the council publishes them.
 */
const APP = 'https://pubapp.northernbeaches.nsw.gov.au/waste';
const PAPER_WEEK = toLocalDate('2026-11-02');
const CONTAINER_WEEK = toLocalDate('2026-11-09');

interface Property {
  id: string;
  /** "1/10 Example Avenue DEE WHY" */
  label: string;
}

export const northernBeaches: CouncilAdapter = {
  id: 'nsw/northern-beaches',
  name: 'Northern Beaches Council',
  state: 'NSW',
  lgaCodes: ['15990'],
  timezone: 'Australia/Sydney',
  website:
    'https://www.northernbeaches.nsw.gov.au/services/rubbish-and-recycling/bins/bin-collection-days',
  platform: 'council-api',

  async getSchedule(address, { http, today }) {
    const { parts } = address;
    if (!parts.houseNumber || !parts.street) {
      throw invalidInput('Northern Beaches lookups need a house number and street', { parts });
    }
    const term = formatStreetLine(parts, { includeUnit: true });
    const searchUrl = `${APP}/waste.ashx?${new URLSearchParams({ term })}`;
    const properties = await getJson<Property[]>(http, searchUrl);
    if (!Array.isArray(properties)) {
      throw parseError('Unexpected response from northernbeaches.nsw.gov.au', { url: searchUrl });
    }

    const suburbOf = (label: string) => /\b[A-Z][A-Z ]+$/.exec(label)?.[0].trim() ?? '';
    const candidates = preferSuburb(
      properties.filter((p) => matchesHouseNumber(p.label, parts)),
      (p) => suburbOf(p.label),
      parts.suburb,
    );
    const property = candidates[0];
    // Several matches in one suburb are the units of one building, which share a calendar.
    if (!property || new Set(candidates.map((p) => suburbOf(p.label))).size !== 1) {
      throw addressNotFound(
        `Northern Beaches Council has no property matching "${address.input}"`,
        {
          suggestions: (candidates.length ? candidates : properties)
            .slice(0, 5)
            .map((p) => p.label),
        },
      );
    }

    const url = `${APP}/wastesearch.ashx`;
    const html = await getText(http, url, {
      method: 'POST',
      body: new URLSearchParams({ property: property.id }),
    });
    const [, day, zone] = /bin-collection-days\/([A-Za-z]+day)([AB])\.pdf/.exec(html) ?? [];
    const weekly = nextWeekday(day ?? '', today);
    const paper = weekdayInWeekOf(day ?? '', PAPER_WEEK);
    const containers = weekdayInWeekOf(day ?? '', CONTAINER_WEEK);
    if (!weekly || !paper || !containers) {
      throw parseError(`No collection calendar listed for ${property.label}`, { url });
    }
    return {
      matchedAddress: property.label,
      services: [
        binService('general', 'Garbage', weekly, 7),
        { ...binService('recycling', 'Paper recycling', paper, 14), colour: 'blue' },
        binService('recycling', 'Container recycling', containers, 14),
        binService('organics', 'Vegetation', zone === 'A' ? containers : paper, 14),
      ],
      sourceUrl: url,
    };
  },
};
