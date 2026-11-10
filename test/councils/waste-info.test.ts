import { describe, expect, it } from 'vitest';
import { parseAustralianAddress } from '../../src/core/address.js';
import { redland } from '../../src/councils/qld/redland.js';
import { parseWasteInfoEvents } from '../../src/platforms/waste-info.js';
import { ctx, fakeHttp, fixture, json } from '../helpers.js';

const events = JSON.parse(fixture('waste-info-redland-property.json'));

const streets = [
  { id: 1, name: 'Abelia Street', locality: 'Alexandra Hills' },
  { id: 2, name: 'Station Street', locality: 'Wellington Point' },
  { id: 3, name: 'Station St', locality: 'Cleveland' }, // some councils abbreviate
];
const properties = [
  { id: 10, name: '1/4 Abelia Street Alexandra Hills' },
  { id: 11, name: '4 Abelia Street Alexandra Hills' },
  { id: 12, name: '9a Abelia Street Alexandra Hills' },
];

function setup() {
  return fakeHttp((url) => {
    if (url.host !== 'redland.waste-info.com.au') return undefined;
    if (url.pathname === '/api/v1/streets.json') return json({ streets });
    if (url.pathname === '/api/v1/properties.json') return json({ properties });
    if (url.pathname.startsWith('/api/v1/properties/')) return json(events);
  });
}

const lookup = (input: string, http = setup()) =>
  redland.getSchedule({ input, parts: parseAustralianAddress(input) }, ctx(http));

describe('waste-info event parser', () => {
  it('parses the real Redland calendar', () => {
    expect(parseWasteInfoEvents(events)).toEqual([
      {
        type: 'general',
        name: 'General waste',
        colour: 'red',
        recurrence: { kind: 'interval', everyDays: 7, anchor: '2026-11-13' },
      },
      {
        type: 'recycling',
        name: 'Recycling',
        colour: 'yellow',
        recurrence: { kind: 'dates', dates: ['2026-11-13', '2026-11-27', '2026-12-11'] },
      },
      {
        type: 'organics',
        name: 'Organics',
        colour: 'lime',
        recurrence: { kind: 'dates', dates: ['2026-11-20', '2026-12-04'] },
      },
    ]);
  });

  it('maps the less common bins and keeps their dates', () => {
    const services = parseWasteInfoEvents([
      { event_type: 'glass', start: '2026-11-12' },
      { event_type: 'glass', start: '2026-12-10' },
      { event_type: 'paper', start: '2026-11-13' },
      { event_type: 'greenwaste', start_date: '2026-11-11' },
      { event_type: 'clean_up', start_date: '2026-11-09' }, // booking day, not a collection
      { event_type: 'clean_up', start: '2027-02-01' },
    ]);
    expect(services.map((s) => [s.type, s.name, s.colour, s.recurrence.kind])).toEqual([
      ['glass', 'Glass', 'purple', 'dates'],
      ['recycling', 'Paper and cardboard', 'blue', 'dates'],
      ['organics', 'Garden waste', 'lime', 'interval'],
      ['bulky', 'Kerbside clean-up', undefined, 'dates'],
    ]);
  });

  it('ignores events that are not bins', () => {
    const special = { event_type: 'special', name: 'Garden waste drop off', start: '2026-11-15' };
    expect(parseWasteInfoEvents([special])).toEqual([]);
  });
});

describe('waste-info adapter (Redland)', () => {
  it('walks street -> property -> calendar for a year from today', async () => {
    const http = setup();
    const schedule = await lookup('4 Abelia St, Alexandra Hills QLD 4161', http);
    expect(schedule.matchedAddress).toBe('4 Abelia Street Alexandra Hills');
    expect(schedule.propertyId).toBe('11');
    expect(schedule.services.map((s) => s.type)).toEqual(['general', 'recycling', 'organics']);
    expect(http.calls.map((u) => u.pathname + u.search)).toEqual([
      '/api/v1/streets.json',
      '/api/v1/properties.json?street=1',
      '/api/v1/properties/11.json?start=2026-11-10&end=2027-11-11',
    ]);
  });

  it('matches units and suffixes exactly', async () => {
    expect((await lookup('1/4 Abelia St Alexandra Hills')).propertyId).toBe('10');
    expect((await lookup('9A Abelia Street Alexandra Hills')).propertyId).toBe('12');
  });

  it('forgives a wrong suburb only when the street is unambiguous', async () => {
    expect((await lookup('4 Abelia Street, Capalaba')).propertyId).toBe('11');
    const error = await lookup('4 Station Street, Capalaba').catch((e: unknown) => e);
    expect(error).toMatchObject({
      code: 'ADDRESS_NOT_FOUND',
      details: {
        suggestions: ['4 Station Street, Wellington Point', '4 Station Street, Cleveland'],
      },
    });
  });

  it('treats a street the council lists twice as one street', async () => {
    const twice = [streets[0], { id: 9, name: 'Abelia St', locality: 'Alexandra Hills' }];
    const http = fakeHttp((url) => {
      if (url.pathname === '/api/v1/streets.json') return json({ streets: twice });
      if (url.pathname === '/api/v1/properties.json') {
        return json({ properties: url.searchParams.get('street') === '9' ? properties : [] });
      }
      if (url.pathname.startsWith('/api/v1/properties/')) return json(events);
    });
    expect((await lookup('4 Abelia Street Alexandra Hills', http)).propertyId).toBe('11');
  });

  it("suggests the street's properties when the number is wrong", async () => {
    await expect(lookup('99 Abelia Street Alexandra Hills')).rejects.toMatchObject({
      code: 'ADDRESS_NOT_FOUND',
      details: { suggestions: properties.map((p) => p.name) },
    });
  });
});
