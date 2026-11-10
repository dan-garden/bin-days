# Progress

What Bin Days covers today, and what is next.

The live list is always at [`/v1/councils`](https://bin-days-rho.vercel.app/v1/councils), or run `npm run cli -- --list`.

## Supported councils (154)

### South Australia (47)

Adelaide, Adelaide Hills, Adelaide Plains, Alexandrina, Berri Barmera, Burnside, Charles Sturt, Clare and Gilbert Valleys, Cleve, Coorong, Copper Coast, Gawler, Goyder, Kangaroo Island, Kingston, Light, Lower Eyre, Marion, Mid Murray, Mitcham, Mount Barker, Mount Gambier, Murray Bridge, Naracoorte Lucindale, Northern Areas, Norwood Payneham and St Peters, Onkaparinga, Playford, Port Adelaide Enfield, Port Augusta, Port Lincoln, Port Pirie, Prospect, Renmark Paringa, Robe, Salisbury, Streaky Bay, Tea Tree Gully, The Flinders Ranges, Tumby Bay, Unley, Wakefield, Walkerville, West Torrens, Whyalla, Yankalilla, Yorke Peninsula

### New South Wales (45)

Armidale, Ballina, Bathurst, Bayside, Bega Valley, Bellingen, Blacktown, Blue Mountains, Burwood, Campbelltown, Canada Bay, Cessnock, Clarence Valley, Coffs Harbour, Cowra, Cumberland, Forbes, Gwydir, Hunter's Hill, Inner West, Kempsey, Kiama, Ku-ring-gai, Lake Macquarie, Leeton, Lismore, Lithgow, Liverpool, MidCoast, Moree Plains, Penrith, Port Macquarie-Hastings, Port Stephens, Queanbeyan-Palerang, Ryde, Shoalhaven, Snowy Valleys, Strathfield, Sydney, The Hills, Tweed, Upper Hunter, Willoughby, Wollongong, Woollahra

### Victoria (37)

Ballarat, Banyule, Baw Baw, Bayside, Benalla, Cardinia, Casey, Colac Otway, Darebin, Glenelg, Hobsons Bay, Horsham, Hume, Kingston, Loddon, Macedon Ranges, Maribyrnong, Maroondah, Melton, Mildura, Moira, Monash, Moorabool, Mornington Peninsula, Mount Alexander, Moyne, Murrindindi, Nillumbik, Port Phillip, Pyrenees, Stonnington, Surf Coast, Swan Hill, Wangaratta, Wellington, Whittlesea, Yarra Ranges

### Queensland (13)

Brisbane, Bundaberg, Cassowary Coast, Fraser Coast, Gladstone, Gold Coast, Gympie, Livingstone, Logan, Mackay, Moreton Bay, Redland, South Burnett

### Western Australia (9)

Bayswater, Gosnells, Joondalup, Kwinana, Mandurah, Rockingham, Serpentine Jarrahdale, South Perth, Swan

### Tasmania (2)

Hobart, Launceston

### Australian Capital Territory (1)

Canberra

### Where the data comes from

| Source                                              | Councils |
| --------------------------------------------------- | -------- |
| Council websites on the OpenCities platform         | 55       |
| South Australia's My Local Services (state service) | 44       |
| waste-info.com.au calendars                         | 36       |
| IntraMaps property maps                             | 11       |
| Councils' own lookups (Casey, Joondalup, Sydney)    | 3        |
| Open datasets (Brisbane, Liverpool, ACT)            | 3        |
| Map layers with dated zones (Launceston, Cardinia)  | 2        |

## Next

Tracked as issues on GitHub:

- [ ] **More IntraMaps councils** ([#1](https://github.com/dan-garden/bin-days/issues/1)). Eleven are done. Kalamunda's address search returned nothing; Wanneroo and Belmont use a different set-up; Greater Dandenong and Melville need an access key we don't have.
- [ ] **Councils whose map service gives a weekday and "week 1 or 2"** ([#2](https://github.com/dan-garden/bin-days/issues/2)): Wyndham, Sutherland, Parramatta, Newcastle, Merri-bek, Moonee Valley and others. Each needs a date checked against the council's own calendar before its fortnightly weeks can be trusted.
- [ ] **More councils with their own lookup** ([#3](https://github.com/dan-garden/bin-days/issues/3)): Sunshine Coast (gives a week number only), Canterbury-Bankstown, Northern Beaches, Central Coast, Stirling, Townsville.
- [ ] **Seven South Australian councils** are in the state service but did not pass an end-to-end check: Barunga West, Campbelltown, Ceduna, Elliston, Karoonda East Murray, Mount Remarkable, Southern Mallee.

[docs/council-candidates.md](docs/council-candidates.md) has earlier research on about 40 large councils.

## Known gaps

- **No Northern Territory yet.**
- **South Australian councils are matched by map zone, not by address.** An address that geocodes to the wrong side of a zone boundary gets its neighbour's days. Fortnightly weeks there are worked out from a rule that was checked against one council's published dates.
- **Cardinia's dates are counted from 2017.** Its map layer gives each bin a start date from then and a cycle; that hasn't been checked against the council's current calendar.
- **Port Phillip, Bathurst and a few other IntraMaps councils publish only a weekday** for some bins, which is read as a weekly collection.
- **Some councils only publish the next date** for each bin (Logan and Yarra Ranges, for example), so later dates can't be shown for them.
- **Public holidays.** Dates worked out from a weekly or fortnightly cycle are marked `projected`, because a holiday can shift them.
- **Ambiguous addresses.** Lookups use free OpenStreetMap data, so "10 Bourke St Melbourne" without a postcode can land on the wrong Bourke Street. Adding the postcode fixes it.
- **Properties with no kerbside service** (some rural addresses) return an error rather than a clear "no service here".
