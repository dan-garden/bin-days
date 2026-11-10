/**
 * Live smoke tests against real council sites, geocoders and boundary
 * services. Run with `npm run test:live`. Run these when adding a council and
 * on a schedule (e.g. weekly CI) to catch councils redesigning their sites.
 */
import { describe, expect, it } from 'vitest';
import { ALL_COUNCILS } from '../../src/councils/index.js';
import { BinDaysService } from '../../src/service.js';

/**
 * Known residential addresses per council, in the varied formats people type.
 * This is the place to drop in an address you want checked. Add at least one
 * whenever you add a council.
 */
const ADDRESSES: Record<string, string[]> = {
  'qld/gold-coast': [
    '833 Southport Nerang Road, Nerang QLD 4211',
    '22 Christine Ave Miami QLD 4220',
    '3 Lakeview Drive, Carrara QLD 4211',
    '3 Lakeview Drive, Merrimac QLD', // wrong suburb; council says Carrara
  ],
  'qld/redland': [
    '4 Abelia Street, Alexandra Hills QLD 4161',
    '9a Abelia St Alexandra Hills',
    '1/62-64 Abelia Street Alexandra Hills QLD',
  ],
  'nsw/cumberland': ['10 Abbott Street Merrylands NSW'],
  'nsw/penrith': ['3 Bundle Street Caddens NSW'],
  'nsw/wollongong': ['1 Bramsen St Bellambi NSW 2518'],
  'vic/ballarat': ['3 Aberdeen Street, Alfredton VIC'],
  'vic/baw-baw': ['1 Acacia Street, Drouin VIC'],
  'vic/benalla': ['1 Ballintine Road, Stewarton VIC'],
  'vic/horsham': ['1 Acacia St, Horsham VIC'],
  'vic/moira': ['8 Abbott St, Wilby VIC'],
  'vic/murrindindi': ['8 Banbury Road, Murrindindi VIC'],
  'vic/wellington': ['11 Abels Road, Longford VIC'],
  'nsw/bayside': ['1 Abercorn Street, Bexley NSW'],
  'nsw/bega-valley': ['1 Abelia Court, Tura Beach NSW'],
  'nsw/bellingen': ['1 Azalea Avenue, Mylestom NSW'],
  'nsw/blue-mountains': ['1 Abbey Street, Leura NSW'],
  'nsw/burwood': ['2 Angelo St, Burwood NSW'],
  'nsw/campbelltown': ['2 Aero Road, Ingleburn NSW'],
  'nsw/canada-bay': ['1 Altona Street, Abbotsford NSW'],
  'nsw/clarence-valley': ['1 Abbott Street, South Grafton NSW'],
  'nsw/coffs-harbour': ['17 Albany Street, Coffs Harbour NSW'],
  'nsw/cowra': ['2 Acacia Cir, Cowra NSW'],
  'nsw/forbes': ['2 Calarie Road, Forbes NSW'],
  'nsw/gwydir': ['2 Derra St, Gravesend NSW'],
  'nsw/inner-west': ['1 Abergeldie Street, Dulwich Hill NSW'],
  'nsw/ku-ring-gai': ['1 Arnold Street, Killara NSW'],
  'nsw/lithgow': ['10 Bathurst Street, Rydal NSW'],
  'nsw/moree-plains': ['1 Acacia Cres, Moree NSW'],
  'nsw/port-macquarie-hastings': ['4 Acacia Avenue, Port Macquarie NSW'],
  'nsw/port-stephens': ['4 Argyle Avenue, Anna Bay NSW'],
  'nsw/queanbeyan-palerang': ['7 Antill Street, Queanbeyan NSW'],
  'nsw/snowy-valleys': ['3 Broughton Street, Tumut NSW'],
  'qld/gympie': ['6 Abel Rd, Lower Wonga QLD'],
  'qld/livingstone': ['1 Barracuda Street, Lammermoor QLD'],
  'qld/south-burnett': ['86 Boldery Road, Brooklands QLD'],
  'nsw/liverpool': [
    '36 Monteclair Avenue, Liverpool NSW 2170',
    '12A Casula Rd Casula NSW',
    '1/65 Memorial Avenue Liverpool NSW',
  ],
  'qld/brisbane': [
    '23 Aberfeldy Street, Kenmore QLD 4069',
    '35 Peel St South Brisbane',
    '201/35 Peel St, South Brisbane QLD 4101',
    '35A Peel Street South Brisbane',
    '12 Latrobe Terrace Paddington QLD',
    '45 Kedron Brook Rd Wilston',
    '40 Oxford St Bulimba 4171',
    '121 Dornoch Tce Highgate Hill',
    '121 Dornoch Tce West End', // wrong suburb; council says Highgate Hill
  ],
};

/** Addresses that don't exist. These must fail, not match a neighbour. */
const NOT_FOUND = [
  '5 Tallebudgera Drive Palm Beach QLD', // used to match 5 Dudgeon Drive, TALLEBUDGERA
  '2/35 Peel St, South Brisbane QLD 4101',
  '8 Dornoch Terrace, West End', // must not become 8 Dornoch Cres, Ferny Grove
  '40 Oxford Street Hawthorne', // wrong suburb, and two suburbs have a 40 Oxford St
  '4 Abelia Street Capalaba QLD', // wrong suburb, and two Redland suburbs have an Abelia Street
];

const service = new BinDaysService();

describe.each(ALL_COUNCILS.map((c) => [c.id] as const))('%s', (id) => {
  it('has a sample address', () => {
    expect(ADDRESSES[id]?.length).toBeGreaterThan(0);
  });

  it.each(ADDRESSES[id] ?? [])('%s', async (address) => {
    const result = await service.lookup({ address });
    expect(result.council.id).toBe(id);
    expect(result.address.matched.toUpperCase()).toContain(
      result.address.parts.streetName?.toUpperCase(),
    );
    expect(result.services.map((s) => s.type)).toContain('general');
    expect(result.days.length).toBeGreaterThan(0);
    // Every regular bin goes out on the property's one collection weekday.
    const binDays = result.days.filter((d) => d.bins.some((b) => b.type !== 'bulky'));
    expect(new Set(binDays.map((d) => d.weekday)).size).toBe(1);
  });
});

it.each(NOT_FOUND)('rejects %s', async (address) => {
  await expect(service.lookup({ address })).rejects.toMatchObject({ code: 'ADDRESS_NOT_FOUND' });
});
