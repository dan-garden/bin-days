# Council candidates

**Done since this was written:** every council found on waste-info.com.au (34, including Redland, Penrith, Cumberland, Wollongong and Inner West) and Liverpool. Nambucca Valley shares the Coffs Coast waste-info site, but its streets returned no properties, so it is not added.

Where the next councils publish bin days, and how hard each looks to add. Probed 2026-11-10 with one to three plain requests per council. Nothing here has been run end to end (address in, dates out), and no terms-of-use or robots.txt review has been done.

- **LGA** codes are from the ABS ASGS 2024 LGA service.
- **Open** means a plain scripted request returned real data. **Blocked** means it got a 403 or a bot challenge; no retry or workaround was attempted.
- **(cp)** means the URL or platform is taken from the community project [mampfes/hacs_waste_collection_schedule](https://github.com/mampfes/hacs_waste_collection_schedule) and was not loaded here.

## Easy or medium: data reachable

| Council | State | LGA | Public page | Data source | Access | Difficulty |
|---|---|---|---|---|---|---|
| Liverpool | NSW | 14900 | not found | Opendatasoft: `data.liverpool.nsw.gov.au`, dataset `bin-collection-days` (68,438 address rows, week 1 / week 2 dates per bin) | Open (re-checked) | easy |
| Melbourne | VIC | 24600 | https://www.melbourne.vic.gov.au/residents/waste-recycling/Pages/bins-collections.aspx | Opendatasoft: `data.melbourne.vic.gov.au`, dataset `garbage-collection-zones` (6 zone polygons; start dates are from 2015, so check it is current) | Open | easy–medium |
| Lake Macquarie | NSW | 14650 | https://www.lakemac.com.au/For-residents/Waste-and-recycling/When-are-your-bins-collected (cp) | OpenCities (existing platform adapter) | Inconsistent: one request returned JSON, a later one got Akamai "Access Denied" | easy if reachable |
| Redland | QLD | 36250 | https://redland.qld.gov.au/BinCollection | waste-info: `redland.waste-info.com.au/api/v1/localities.json` | API open (re-checked); www blocked | medium |
| Penrith | NSW | 16350 | https://www.penrithcity.nsw.gov.au/waste-environment/waste/waste-collection-schedules | waste-info: `penrith.waste-info.com.au` | Open | medium |
| Cumberland | NSW | 12380 | https://www.cumberland.nsw.gov.au/find-your-bin-day | waste-info: `cumberland.waste-info.com.au` | API open; www blocked | medium |
| Wollongong | NSW | 18450 | https://wollongongwaste.com (cp) | waste-info: `wollongong.waste-info.com.au` | API open; www blocked | medium |
| Inner West | NSW | 14170 | https://www.innerwest.nsw.gov.au/waste-and-recycling/bin-collection-day | waste-info, split by former council: `leichhardt.` answered, `marrickville.` timed out, `ashfield.` untested | Open (leichhardt) | medium |
| Moreton Bay | QLD | 35010 | https://www.moretonbay.qld.gov.au/Services/Waste-Recycling/Collections/Bin-Days | ArcGIS: `services-ap1.arcgis.com/152ojN3Ts9H3cdtl/arcgis/rest/services/MBRC_Waste/FeatureServer/0` (per property: ADDRESS, Bin_Day, Recycle_Week) | ArcGIS open; www blocked | medium |
| Wyndham | VIC | 27260 | digital.wyndham.vic.gov.au/myWyndham/ (not loaded) | ArcGIS: `services3.arcgis.com/lfHi3I35DWultHqw/arcgis/rest/services/BinCollectionData/FeatureServer/0` (EZI_ADD, Day, Week) | Open | medium |
| Sutherland | NSW | 17150 | https://www.sutherlandshire.nsw.gov.au/living-here/waste-and-recycling/bin-collection (cp) | ArcGIS: `geoserver.ssc.nsw.gov.au/arcgis/rest/services/WebOnline/MapServer/4` (per property) | Metadata open; www blocked | medium |
| Parramatta | NSW | 16260 | https://www.cityofparramatta.nsw.gov.au/residents/bins-waste-and-recycling/bin-collection-days | ArcGIS zone polygons: `services6.arcgis.com/NrOjMi9LSYL3MUze/arcgis/rest/services/CoP_Garbage_Recyle_July2021/FeatureServer/0` | ArcGIS open; www blocked | medium |
| Newcastle | NSW | 15900 | https://newcastle.nsw.gov.au/collections | ArcGIS zone polygons: `services-ap1.arcgis.com/CNeUPE1voVc22gNk/arcgis/rest/services/WasteCollectionDay/FeatureServer/0` | Open | medium |
| Onkaparinga | SA | 45340 | https://www.onkaparingacity.com/Services/Waste-and-recycling/Bin-collections | SA "My Local Services" ArcGIS | ArcGIS open; www blocked | medium |
| Salisbury | SA | 47140 | https://www.salisbury.sa.gov.au/services/waste-and-recycling/waste-collection-schedule | SA "My Local Services" ArcGIS | Open | medium |
| Port Adelaide Enfield | SA | 45890 | https://ecouncil.portenf.sa.gov.au/public/propertywastedates/public.aspx | SA "My Local Services" ArcGIS | Open; www blocked | medium |
| Charles Sturt | SA | 41060 | https://www.charlessturt.sa.gov.au/services/waste-and-recycling/bins | SA "My Local Services" ArcGIS | ArcGIS open; www blocked | medium |
| ACT | ACT | 89399 | https://www.cityservices.act.gov.au/recycling-and-waste/collection/bin-collection-calendar | Socrata: `https://www.data.act.gov.au/resource/jzzy-44un.json` (by suburb, with next pickup dates) | Open | medium |
| Sunshine Coast | QLD | 36720 | https://www.sunshinecoast.qld.gov.au/living-and-community/waste-and-recycling/bin-collection-days (cp) | Custom JSON: `/__server__/api/v1/streets/<name>` (street, locality, day, week) | Open | medium |
| Casey | VIC | 21610 | https://www.casey.vic.gov.au/find-your-bin-collection-day (cp) | Custom JSON: `/coc-properties/api/search-address?term=…&bin_collection_details=true` (day and next dates in one call) | Open | medium |
| Joondalup | WA | 54170 | https://www.joondalup.wa.gov.au/residents/waste-and-recycling/residential-bin-collections (cp) | Custom JSON: `/aapi/coj/propertylookup/<term>`, then `/aapi/coj/bindatelookup/<key>` (cp) | Open | medium |
| City of Sydney | NSW | 17200 | https://www.cityofsydney.nsw.gov.au/waste-recycling-services/find-my-bin-collection-day | Custom JSON: `cos-bin-collection-widget.netlify.app/api/search?address=`, then `/api/property/<key>/bins-collection` (cp) | Open | medium |
| Canterbury-Bankstown | NSW | 11570 | https://www.cbcity.nsw.gov.au/residents/bin-collection-days | One bulk file: `https://bindayfinder.azurewebsites.net/streetData.json.gz` (exists; contents not inspected) | Open | medium |
| Central Coast | NSW | 11650 | https://1coast.com.au/ (cp) | 1Coast: `1coast.com.au/ajax.php?a=search&s=` (frequency code and day; dates need an HTML page) | Open | medium |
| Stirling | WA | 57910 | https://www.stirling.wa.gov.au/waste-and-environment/waste-and-recycling/bin-collections | Custom JSON `/bincollectioncheck/getresult` (seen in page; not called) | Page open; API unverified | medium |
| Northern Beaches | NSW | 15990 | https://www.northernbeaches.nsw.gov.au/services/rubbish-and-recycling/bins/bin-collection-days | `pubapp.northernbeaches.nsw.gov.au/waste/waste.ashx?term=`, then a POST returning HTML (cp) | Open | medium–hard |

## Hard: blocked, PDF only, or multi-step

| Council | State | LGA | Public page | Data source | Why hard |
|---|---|---|---|---|---|
| Logan | QLD | 34590 | https://www.logan.qld.gov.au/MyLogan (cp) | OpenCities (cp) | Blocked (Akamai) |
| Ipswich | QLD | 33960 | https://www.ipswich.qld.gov.au/live/waste-and-recycling/bin-collection | OpenCities (unverified); mobile app back end `api.whatbinday.com` (cp, untested) | Blocked (Akamai) |
| Toowoomba | QLD | 36910 | https://www.tr.qld.gov.au/Home/My-area | Unverified, probably OpenCities | Blocked (Akamai) |
| Blacktown | NSW | 10750 | https://www.blacktown.nsw.gov.au/Services/Waste-services-and-collection/Bin-collection-and-new-service-delivery-days (cp) | OpenCities (cp) | Blocked (Akamai) |
| Hume | VIC | 23270 | https://hume.vic.gov.au/Know-my-bin-day | OpenCities (cp) | Blocked (Akamai) |
| Whittlesea | VIC | 27070 | https://www.whittlesea.vic.gov.au/Services/Rubbish-and-bins/Check-my-bin-collection-day | OpenCities (cp) | Blocked (Akamai) |
| Monash | VIC | 24970 | https://www.monash.vic.gov.au/Waste-Sustainability/Bin-Collection/When-we-collect-your-bins (cp) | OpenCities (cp) | Blocked (Akamai) |
| Melton | VIC | 24650 | https://www.melton.vic.gov.au/My-Area (cp) | OpenCities (cp) | Blocked (Akamai) |
| Hobart | TAS | 62810 | https://www.hobartcity.com.au/Residents/Waste-and-recycling/When-is-my-bin-collected (cp) | OpenCities (cp) | Blocked (Akamai) |
| Cairns | QLD | 32080 | https://www.cairns.qld.gov.au/water-waste-roads/waste-and-recycling/bin-collection/find-bin-day (cp) | Custom `/_external/my-property/address-search` (cp) | Blocked (Cloudflare challenge) |
| Townsville | QLD | 37010 | https://www.townsville.qld.gov.au/zerowaste | ServiceNow: `mitownsville.service-now.com/api/cio19/bin_collection_dates/getBinCollectionCal?p_id=` | No known way from address to property id |
| Greater Geelong | VIC | 22750 | https://app.geelongcity.vic.gov.au/recycling/calendar/ | ASP.NET WebForms | VIEWSTATE post and HTML scrape |
| Swan | WA | 58050 | https://www.swan.wa.gov.au/waste-and-sustainability/waste-and-recycling-services/bins/find-my-bin-day | TechnologyOne IntraMaps | Multi-step session; API unverified |
| Wanneroo | WA | 58760 | https://www.wanneroo.wa.gov.au/bincollections | TechnologyOne IntraMaps | Multi-step session; API unverified |
| Brimbank | VIC | 21180 | https://www.brimbank.vic.gov.au/bins | PDF calendar | PDF only |
| Darwin | NT | 71000 | https://www.darwin.nt.gov.au/resident-services/waste-recycling/my-bin-day | Drupal webform plus PDF calendars | Form is bot-protected |

## Platforms worth an adapter

- **waste-info.com.au** (Penrith, Cumberland, Wollongong, Redland, Inner West here; the community project lists about 30 more). All returned the same `localities.json` shape. Best value.
- **ArcGIS feature services** (Moreton Bay, Wyndham, Sutherland by address attribute; Parramatta, Newcastle by point-in-polygon zone). Field names differ per council, so the adapter needs per-council config.
- **SA "My Local Services" ArcGIS**: `https://services1.arcgis.com/37apdbovSVEwr4YE/ArcGIS/rest/services/MyLocalServices/FeatureServer/{0,1,2,4}/query`. One lat/lon point query covers most South Australian councils. Only layer 0 (general waste) was queried.
- **OpenCities**: ten councils here use it, but nine sit behind Akamai and Lake Macquarie was inconsistent.

## Things to know before starting

- **A blocked website does not mean blocked data.** Moreton Bay, Parramatta, Redland, Cumberland, Wollongong, Liverpool and Sutherland block their main site but serve the data from another host.
- **Most sources give a weekday plus week A/B, not dates.** Only Liverpool, ACT and Casey returned actual dates. The rest need a per-council anchor date.
- **The community project reaches the Akamai-protected councils by impersonating a browser.** That is getting around bot protection, so it is a decision to make deliberately, not a default.
- **ACT is by suburb, not address.**
