# Progress

What Bin Days covers today, and what is next.

The live list is always at [`/v1/councils`](https://bindays.au/v1/councils), or run `npm run cli -- --list`.

## Supported councils (205)

### South Australia (52)

Adelaide, Adelaide Hills, Adelaide Plains, Alexandrina, Barunga West, Berri Barmera, Burnside, Campbelltown, Charles Sturt, Clare and Gilbert Valleys, Cleve, Coorong, Copper Coast, Elliston, The Flinders Ranges, Gawler, Goyder, Kangaroo Island, Kingston, Light, Lower Eyre, Marion, Mid Murray, Mitcham, Mount Barker, Mount Gambier, Mount Remarkable, Murray Bridge, Naracoorte Lucindale, Northern Areas, Norwood Payneham and St Peters, Onkaparinga, Playford, Port Adelaide Enfield, Port Augusta, Port Lincoln, Port Pirie, Prospect, Renmark Paringa, Robe, Salisbury, Southern Mallee, Streaky Bay, Tea Tree Gully, Tumby Bay, Unley, Wakefield, Walkerville, West Torrens, Whyalla, Yankalilla, Yorke Peninsula

### New South Wales (53)

Armidale, Ballina, Bathurst, Bayside, Bega Valley, Bellingen, Blacktown, Blue Mountains, Burwood, Campbelltown, Canada Bay, Canterbury Bankstown, Central Coast, Cessnock, Clarence Valley, Coffs Harbour, Cowra, Cumberland, Forbes, Gwydir, The Hills, Hornsby, Hunter's Hill, Inner West, Kempsey, Kiama, Ku-ring-gai, Lake Macquarie, Lane Cove, Leeton, Lismore, Lithgow, Liverpool, MidCoast, Moree Plains, Mosman, Newcastle, Northern Beaches, Penrith, Port Macquarie-Hastings, Port Stephens, Queanbeyan-Palerang, Ryde, Shoalhaven, Snowy Valleys, Strathfield, Sydney, Tweed, Upper Hunter, Willoughby, Wollondilly, Wollongong, Woollahra

### Victoria (59)

Alpine, Ballarat, Banyule, Baw Baw, Bayside, Benalla, Boroondara, Cardinia, Casey, Central Goldfields, Colac Otway, Corangamite, Darebin, Frankston, Gannawarra, Glen Eira, Glenelg, Greater Bendigo, Greater Geelong, Hindmarsh, Hobsons Bay, Horsham, Hume, Kingston, Knox, Loddon, Macedon Ranges, Mansfield, Maribyrnong, Maroondah, Melbourne, Melton, Merri-bek, Mildura, Moira, Monash, Moonee Valley, Moorabool, Mornington Peninsula, Mount Alexander, Moyne, Murrindindi, Nillumbik, Northern Grampians, Port Phillip, Pyrenees, Queenscliffe, Southern Grampians, Stonnington, Strathbogie, Surf Coast, Swan Hill, Wangaratta, Wellington, Whitehorse, Whittlesea, Yarra, Yarra Ranges, Yarriambiack

### Queensland (16)

Brisbane, Bundaberg, Cassowary Coast, Fraser Coast, Gladstone, Gold Coast, Gympie, Hinchinbrook, Livingstone, Logan, Mackay, Moreton Bay, Redland, Scenic Rim, South Burnett, Sunshine Coast

### Western Australia (20)

Armadale, Bassendean, Bayswater, Belmont, Bunbury, Cambridge, Canning, Cockburn, Gosnells, Joondalup, Kalamunda, Kwinana, Mandurah, Murray, Rockingham, Serpentine Jarrahdale, South Perth, Stirling, Swan, Vincent

### Tasmania (4)

Clarence, Glenorchy, Hobart, Launceston

### Australian Capital Territory (1)

Canberra

### Where the data comes from

| Source                                                    | Councils |
| --------------------------------------------------------- | -------- |
| Council websites on the OpenCities platform               | 60       |
| South Australia's My Local Services (state service)       | 49       |
| waste-info.com.au calendars                               | 38       |
| Councils' own lookups (Casey, Sydney, Geelong, others)    | 25       |
| IntraMaps property maps                                   | 12       |
| Zone files councils publish (Bendigo, Frankston, others)  | 9        |
| Councils' map layers (Launceston, Newcastle, others)      | 8        |
| Open datasets (Brisbane, Melbourne, Liverpool, ACT)       | 4        |

## Next

Tracked as issues on GitHub:

- [ ] **More IntraMaps councils** ([#1](https://github.com/dan-garden/bin-days/issues/1)). Twelve are done. Wanneroo, Greater Dandenong and Melville need an access key we don't have.
- [ ] **Councils whose map service gives a weekday and "week 1 or 2"** ([#2](https://github.com/dan-garden/bin-days/issues/2)). Newcastle, Moonee Valley, Yarra and Bassendean are done, using dates or formulas the councils publish themselves. Wyndham and Parramatta still need a date from the council's calendar; Sutherland, Wingecarribee, Albany and Mundaring are blocked for other reasons, listed on the issue.
- [ ] **More councils with their own lookup** ([#3](https://github.com/dan-garden/bin-days/issues/3)). All done except Townsville, which has no way from an address to its property.
- [ ] **Councils another bin day site covers and we don't** ([#11](https://github.com/dan-garden/bin-days/issues/11)). 39 of the 66 are done. Campaspe, Albany and Byron have a usable source and are next; the rest refuse our requests, need an access key, or publish only a calendar. The issue has the reason for each.
- [ ] **Two South Australian councils** are in the state service but did not pass an end-to-end check: Ceduna and Karoonda East Murray.

[docs/council-candidates.md](docs/council-candidates.md) has earlier research on about 40 large councils.

## Known gaps

- **No Northern Territory yet.**
- **South Australian councils are matched by map zone, not by address.** An address that geocodes to the wrong side of a zone boundary gets its neighbour's days. Fortnightly weeks there are worked out from a rule that was checked against one council's published dates.
- **Cardinia's dates are counted from 2017.** Its map layer gives each bin a start date from then and a cycle; that hasn't been checked against the council's current calendar.
- **Councils read from a zone file are matched by map zone, not by address** (Bendigo, Frankston, Glen Eira, Boroondara, Melbourne and others), with the same boundary caveat as South Australia.
- **City of Melbourne's zones come from a dataset last updated in 2021.** It has general waste and recycling only, and its site refuses our requests, so the days could not be checked against the council's current page.
- **Corangamite, Central Goldfields and Yarriambiack are read from datasets several years old.** Their fortnights were checked against each council's current calendar, but zone boundaries were not.
- **Some bins are left out because their source has no dates for them:** glass in Corangamite, Hindmarsh and Yarriambiack, the optional green bin in Central Goldfields, and St Arnaud's food and garden bin (Northern Grampians).
- **Strathbogie publishes a new zone dataset each July,** so its address needs updating then.
- **Armadale says only "this week" or "next week" for recycling.** That is read as Monday to Sunday; a lookup made on a Sunday may be a week out.
- **Mosman, Canning and Southern Grampians (organics) only give the next date** for some bins.
- **Alpine and Mansfield's cycles come from the councils' waste pages,** not from the lookup, which gives only the next date.
- **Northern Beaches' fortnights were read from the council's 2026 calendars.** They need checking again when the 2027 calendars come out.
- **Sunshine Coast is matched by street, not by house,** because that is all the council's own page uses.
- **City of Stirling is matched by map point.** Where the address can only be placed on its street, the houses about 30 metres either side are asked instead, and the answer is used only if they agree.
- **City of Belmont only gives each bin's next date,** so later dates can't be shown.
- **Port Phillip, Bathurst and a few other IntraMaps councils publish only a weekday** for some bins, which is read as a weekly collection.
- **Some councils only publish the next date** for each bin (Logan and Yarra Ranges, for example), so later dates can't be shown for them.
- **Public holidays.** Dates worked out from a weekly or fortnightly cycle are marked `projected`, because a holiday can shift them.
- **Ambiguous addresses.** Lookups use free OpenStreetMap data, so "10 Bourke St Melbourne" without a postcode can land on the wrong Bourke Street. Adding the postcode fixes it.
- **Properties with no kerbside service** (some rural addresses) return an error rather than a clear "no service here".
