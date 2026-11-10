# Progress

What Bin Days covers today, and what is next.

The live list is always at [`/v1/councils`](https://bin-days-rho.vercel.app/v1/councils), or run `npm run cli -- --list`.

## Supported councils (138)

### South Australia (47)

Adelaide, Adelaide Hills, Adelaide Plains, Alexandrina, Berri Barmera, Burnside, Charles Sturt, Clare and Gilbert Valleys, Cleve, Coorong, Copper Coast, Gawler, Goyder, Kangaroo Island, Kingston, Light, Lower Eyre, Marion, Mid Murray, Mitcham, Mount Barker, Mount Gambier, Murray Bridge, Naracoorte Lucindale, Northern Areas, Norwood Payneham and St Peters, Onkaparinga, Playford, Port Adelaide Enfield, Port Augusta, Port Lincoln, Port Pirie, Prospect, Renmark Paringa, Robe, Salisbury, Streaky Bay, Tea Tree Gully, The Flinders Ranges, Tumby Bay, Unley, Wakefield, Walkerville, West Torrens, Whyalla, Yankalilla, Yorke Peninsula

### New South Wales (43)

Armidale, Ballina, Bayside, Bega Valley, Bellingen, Blacktown, Blue Mountains, Burwood, Campbelltown, Canada Bay, Cessnock, Clarence Valley, Coffs Harbour, Cowra, Cumberland, Forbes, Gwydir, Hunter's Hill, Inner West, Kempsey, Kiama, Ku-ring-gai, Lake Macquarie, Leeton, Lismore, Lithgow, Liverpool, MidCoast, Moree Plains, Penrith, Port Macquarie-Hastings, Port Stephens, Queanbeyan-Palerang, Ryde, Shoalhaven, Snowy Valleys, Strathfield, The Hills, Tweed, Upper Hunter, Willoughby, Wollongong, Woollahra

### Victoria (33)

Ballarat, Banyule, Baw Baw, Benalla, Colac Otway, Darebin, Glenelg, Hobsons Bay, Horsham, Hume, Kingston, Loddon, Macedon Ranges, Maribyrnong, Maroondah, Melton, Mildura, Moira, Monash, Moorabool, Mornington Peninsula, Mount Alexander, Moyne, Murrindindi, Nillumbik, Pyrenees, Stonnington, Surf Coast, Swan Hill, Wangaratta, Wellington, Whittlesea, Yarra Ranges

### Queensland (12)

Brisbane, Bundaberg, Cassowary Coast, Gladstone, Gold Coast, Gympie, Livingstone, Logan, Mackay, Moreton Bay, Redland, South Burnett

### Australian Capital Territory (1)

Canberra

### Tasmania (1)

Hobart

### Western Australia (1)

Gosnells

### Where the data comes from

| Source                                              | Councils |
| --------------------------------------------------- | -------- |
| Council websites on the OpenCities platform         | 55       |
| South Australia's My Local Services (state service) | 44       |
| waste-info.com.au calendars                         | 36       |
| Open datasets (Brisbane, Liverpool, ACT)            | 3        |

## Next

Not started. Each of these would bring in several councils at once:

- [ ] **IntraMaps**, a mapping system about 16 councils use for bin days, mostly around Perth (Wanneroo, Swan, Rockingham, Mandurah, Melville) plus Bayside, Port Phillip and Greater Dandenong in Victoria.
- [ ] **Councils that publish a map service:** Wyndham, Sutherland, Parramatta, Newcastle, Darebin, Merri-bek, Moonee Valley, Yarra, Cardinia, Launceston.
- [ ] **WhatBinDay:** Ipswich, Kingston (Vic) and others.
- [ ] **Councils with their own lookup:** Sunshine Coast, Casey, Joondalup, City of Sydney, Canterbury-Bankstown, Northern Beaches, Central Coast, Townsville, Stirling.
- [ ] **Seven South Australian councils** are in the state service but did not pass an end-to-end check: Barunga West, Campbelltown, Ceduna, Elliston, Karoonda East Murray, Mount Remarkable, Southern Mallee.

[docs/council-candidates.md](docs/council-candidates.md) has earlier research on about 40 large councils.

## Known gaps

- **No Northern Territory, and only one council each in Western Australia and Tasmania.**
- **South Australian councils are matched by map zone, not by address.** An address that geocodes to the wrong side of a zone boundary gets its neighbour's days. Fortnightly weeks there are worked out from a rule that was checked against one council's published dates.
- **Some councils only publish the next date** for each bin (Logan and Yarra Ranges, for example), so later dates can't be shown for them.
- **Public holidays.** Dates worked out from a weekly or fortnightly cycle are marked `projected`, because a holiday can shift them.
- **Ambiguous addresses.** Lookups use free OpenStreetMap data, so "10 Bourke St Melbourne" without a postcode can land on the wrong Bourke Street. Adding the postcode fixes it.
- **Properties with no kerbside service** (some rural addresses) return an error rather than a clear "no service here".
