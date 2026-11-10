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
  'nsw/armidale': ['1/92 Mann Street ARMIDALE NSW 2350'],
  'nsw/ballina': ['1 Mainsail Place WEST BALLINA NSW'],
  'nsw/blacktown': ['1 Moni Way, DOONSIDE NSW 2767'],
  'nsw/cessnock': ['1 Main RD, Heddon Greta NSW 2321'],
  'nsw/hunters-hill': ['3/20A Church St, Hunters Hill 2110 NSW'],
  'nsw/kempsey': ['1 Main Street Crescent Head NSW'],
  'nsw/kiama': ['Terralong Street, Kiama NSW 2533'],
  'nsw/lake-macquarie': ['1 Main Road, CARDIFF HEIGHTS NSW 2285'],
  'nsw/leeton': ['1 Main Avenue, YANCO 2703 NSW'],
  'nsw/lismore': ['Molesworth Street, Lismore NSW 2480'],
  'nsw/mid-coast': ['Victoria Street, Taree NSW 2430'],
  'qld/bundaberg': ['1 Main ST YANDARAN, 4673 QLD'],
  'qld/cassowary-coast': ['3 Church Street EAST INNISFAIL 4860 QLD'],
  'qld/gladstone': ['1 Minya Close, BOYNE ISLAND 4680 QLD'],
  'qld/logan': ['1 Minnie Place WINDAROO 4207 QLD'],
  'qld/mackay': ['1 Main Street BAKERS CREEK QLD 4740'],
  'qld/moreton-bay': ['1 Main Street, BEACHMERE Queensland 4510'],
  'sa/adelaide': ['Franklin Street, Adelaide SA 5000'],
  'sa/adelaide-hills': ['Western Branch Road, Woodside SA 5244'],
  'sa/adelaide-plains': ['Dublin Road, Mallala SA 5501'],
  'sa/alexandrina': ['Waterport Road, Port Elliot SA 5212'],
  'sa/berri-barmera': ['Stacey Road, Glossop SA 5344'],
  'sa/burnside': ['1/1 Main Street EASTWOOD SA 5063'],
  'sa/charles-sturt': ['Sheffield Street, Woodville North SA 5012'],
  'sa/clare-and-gilbert-valleys': ['Beare Street, Clare SA 5453'],
  'sa/cleve': ['Railway Terrace, Rudall SA 5642'],
  'sa/coorong': ['Princes Highway, Meningie SA 5264'],
  'sa/copper-coast': ['Warmington Road, East Moonta SA 5558'],
  'sa/flinders-ranges': ['Old Ghan Railway, Kanyaka SA 5434'],
  'sa/gawler': ['Second Street, Gawler South SA 5118'],
  'sa/goyder': ['Worlds End Highway, Robertstown SA 5381'],
  'sa/kangaroo-island': ['Wedgewood Road, Seddon SA 5223'],
  'sa/kingston': ['Southern Ports Highway, Kingston SE SA 5275'],
  'sa/light': ['Ibis Mews, Hewett SA 5118'],
  'sa/lower-eyre-peninsula': ['Shepperd Avenue, Coffin Bay SA 5607'],
  'sa/marion': ['Minkie Avenue, Mitchell Park SA 5043'],
  'sa/mid-murray': ['Horstmann Crescent, Swan Reach SA 5354'],
  'sa/mitcham': ['Tutt Avenue, Kingswood SA 5062'],
  'sa/mount-barker': ['Paechtown Road, Hahndorf SA 5245'],
  'sa/mount-gambier': ['Kennedy Avenue, Mount Gambier SA 5290'],
  'sa/murray-bridge': ['Schultz Road, Kepa SA 5259'],
  'sa/naracoorte-lucindale': ['B240, Naracoorte SA 5271'],
  'sa/northern-areas': ['Howleys Crossing Road, Spalding SA 5454'],
  'sa/norwood-payneham-and-st-peters': ['Thrower Avenue, Felixstow SA 5070'],
  'sa/onkaparinga': ['1/1 Main Street, SEAFORD SA 5169'],
  'sa/playford': ['Beagle Hole Road, Adelaide SA 5120'],
  'sa/port-adelaide-enfield': ['Grose Crescent, North Haven SA 5018'],
  'sa/port-augusta': ['Kirby Court, Port Augusta West SA 5700'],
  'sa/port-lincoln': ['Garrett Road, Port Lincoln SA 5606'],
  'sa/port-pirie': ['Annie Street, Port Pirie West SA 5540'],
  'sa/prospect': ['Kingston Lane, Prospect SA 5082'],
  'sa/renmark-paringa': ['Brewarrina Street, Renmark North SA 5341'],
  'sa/robe': ['Morphett Street, Robe SA 5276'],
  'sa/salisbury': ['Cypress Drive, Parafield Gardens SA 5107'],
  'sa/streaky-bay': ['Slidys Road, Streaky Bay SA 5680'],
  'sa/tea-tree-gully': ['Verdelho Street, Wynn Vale SA 5127'],
  'sa/tumby-bay': ['Anchor Drive, Port Neill SA 5604'],
  'sa/unley': ['3 Church Street Highgate 5063 SA'],
  'sa/wakefield': ['Gwy Terrace, Balaklava SA 5461'],
  'sa/walkerville': ['Vales Close, Vale Park SA 5081'],
  'sa/west-torrens': ['Dew Street, Thebarton SA 5031'],
  'sa/whyalla': ['Meares Street, Whyalla SA 5600'],
  'sa/yankalilla': ['Wild Dog Creek Road, Myponga SA 5202'],
  'sa/yorke-peninsula': ['James Well Road, Ardrossan SA 5571'],
  'vic/banyule': ['1 Main Road, LOWER PLENTY VIC'],
  'vic/darebin': ['1 MAIN DRIVE BUNDOORA 3083 VIC'],
  'vic/hobsons-bay': ['Sussex Street, Seaholme VIC'],
  'vic/hume': ['1 MOYNE CRES, COOLAROO 3048 VIC'],
  'vic/kingston': ['1 Main Road, CLAYTON SOUTH, 3169 VIC'],
  'vic/loddon': ['1 Main Road, Laanecoorie VIC 3463'],
  'vic/macedon-ranges': ['1 MAIN STREET, ROMSEY VIC 3434'],
  'vic/maribyrnong': ['Alberta St, West Footscray VIC'],
  'vic/maroondah': ['1 Mena Avenue Croydon VIC 3136'],
  'vic/melton': ['1 MONIE PLACE HILLSIDE 3037 VIC'],
  'vic/mildura': ['1 Main Avenue S, MERBEIN VIC 3505'],
  'vic/monash': ['1 Manna Court, Mulgrave 3170 VIC'],
  'vic/moorabool': ['1 Main Street Gordon VIC 3345'],
  'vic/mornington-peninsula': ['1 Main Street MORNINGTON VICTORIA 3931'],
  'vic/mount-alexander': ['1 Main Road CAMPBELLS CREEK VICTORIA 3451'],
  'vic/moyne': ['1 Moyne Court, PORT FAIRY 3284 VIC'],
  'vic/nillumbik': ['1/1316 MAIN ROAD, ELTHAM 3095 VIC'],
  'vic/pyrenees': ['2 STATION STREET, AVOCA, 3467 VIC'],
  'vic/stonnington': ['2 Station Place, MALVERN VIC'],
  'vic/surf-coast': ['1 MAIN STREET WINCHELSEA VIC'],
  'vic/swan-hill': ['1 MANNA STREET SWAN HILL 3585 VIC'],
  'vic/wangaratta': ['3 Church Street GLENROWAN VIC 3675'],
  'vic/whittlesea': ['1 MAIN STREET, THOMASTOWN 3074 VIC'],
  'vic/yarra-ranges': ['1 Main Street UPWEY VIC 3158'],
  'act/canberra': ['Liversidge Street, Acton ACT 2601'],
  'nsw/ryde': ['2/92 Station Street, West Ryde 2114 NSW'],
  'nsw/shoalhaven': ['1 Moonah Av, MOLLYMOOK BEACH NSW'],
  'nsw/strathfield': ['4 Mooney Street, STRATHFIELD SOUTH, 2136 NSW'],
  'nsw/the-hills': ['1 Moona Avenue, BAULKHAM HILLS NSW 2153'],
  'nsw/tweed': ['32 Main Road Fingal Head NSW 2487'],
  'nsw/upper-hunter': ['1 Main Street SCONE NSW'],
  'nsw/willoughby': ['1 Mooney Street, Lane Cove North NSW 2066'],
  'nsw/woollahra': ['1 Mona Road DARLING POINT NSW 2027'],
  'tas/hobart': ['1 MONA STREET, BATTERY POINT 7004 TAS'],
  'vic/colac-otway': ['1 Old Main Road, GELLIBRAND VIC 3239'],
  'vic/glenelg': ['1 Myuna Court, Portland VIC 3305'],
  'wa/gosnells': ['1 Mona Avenue BECKENHAM WA 6107'],
  'nsw/bathurst': ['230 Howick Street, Bathurst NSW 2795'],
  'qld/fraser-coast': ['57 Arbornine Road, Glenwood QLD 4570'],
  'vic/bayside': ['76 Royal Avenue, Sandringham VIC 3191'],
  'vic/port-phillip': ['9 Spray Street, Elwood VIC 3184'],
  'wa/bayswater': ['9 Wholley Street, Bayswater WA 6053'],
  'wa/kwinana': ['20 Medina Avenue, Medina WA 6167'],
  'wa/mandurah': ['932 Estuary Road, Bouvard WA 6211'],
  'wa/rockingham': ['59 Makybe Drive, Baldivis WA 6171'],
  'wa/serpentine-jarrahdale': ['5 Pingaring Court, Byford WA 6122'],
  'wa/south-perth': ['156 Lansdowne Road, Kensington WA 6151'],
  'wa/swan': ['34 Oldenburg Pass, Stratton WA 6056'],
  'nsw/sydney': ['17 Junction Street, Forest Lodge NSW 2037'],
  'tas/launceston': ['18 St John Street, Launceston TAS 7250'],
  'vic/cardinia': ['20 Siding Avenue, Officer VIC 3809'],
  'vic/casey': ['2 Patrick Northeast Drive, Narre Warren VIC 3805'],
  'wa/joondalup': ['212 Trappers Drive, Woodvale WA 6026'],
  'nsw/canterbury-bankstown': ['32 Lesley Avenue, Revesby NSW 2212'],
  'nsw/central-coast': ['49 Old Gosford Road, Wamberal NSW 2260'],
  'nsw/newcastle': ['12 Stewart Avenue, Hamilton NSW 2303'],
  'nsw/northern-beaches': ['10 Oaks Avenue, Dee Why NSW 2099'],
  'qld/sunshine-coast': ['12 Bulcock Street, Caloundra QLD 4551'],
  'vic/merri-bek': ['7/25A Arthur Street, Coburg North VIC 3058'],
  'vic/moonee-valley': ['25 Sapphire Street, Niddrie VIC 3042'],
  'vic/yarra': ['333 Bridge Road, Richmond VIC 3121'],
  'wa/bassendean': ['4 Railway Parade, Bassendean WA 6054'],
  'wa/belmont': ['12 Wheatley Street, Kewdale WA 6105'],
  'wa/kalamunda': ['43 Railway Road, Kalamunda WA 6076'],
  'wa/stirling': ['20 Lynn Street, Trigg WA 6029'],
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
    // Most sources match a property. Suburb- and zone-based ones only know the locality.
    const { streetName = '', suburb = '' } = result.address.parts;
    expect(result.address.matched.toUpperCase()).toMatch(
      new RegExp(`${streetName}|${suburb}`.toUpperCase()),
    );
    expect(result.services.map((s) => s.type)).toContain('general');
    expect(result.days.length).toBeGreaterThan(0);
  });
});

it.each(NOT_FOUND)('rejects %s', async (address) => {
  await expect(service.lookup({ address })).rejects.toMatchObject({ code: 'ADDRESS_NOT_FOUND' });
});
