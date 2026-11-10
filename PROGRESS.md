# Progress

What Bin Day covers today, and what is next.

The live list is always at [`/v1/councils`](https://bin-days-rho.vercel.app/v1/councils), or run `npm run cli -- --list`.

## Supported councils (37)

### New South Wales (24)

Bayside, Bega Valley, Bellingen, Blue Mountains, Burwood, Campbelltown, Canada Bay, Clarence Valley, Coffs Harbour, Cowra, Cumberland, Forbes, Gwydir, Inner West, Ku-ring-gai, Lithgow, Liverpool, Moree Plains, Penrith, Port Macquarie-Hastings, Port Stephens, Queanbeyan-Palerang, Snowy Valleys, Wollongong

### Victoria (7)

Ballarat, Baw Baw, Benalla, Horsham, Moira, Murrindindi, Wellington

### Queensland (6)

Brisbane, Gold Coast, Gympie, Livingstone, Redland, South Burnett

### Where the data comes from

| Source                                    | Councils |
| ----------------------------------------- | -------- |
| waste-info.com.au calendars               | 34       |
| Council open datasets (Brisbane, Liverpool) | 2      |
| Council website (Gold Coast)              | 1        |

## Next

Not started. Each of these would bring in several councils at once:

- [ ] **South Australia.** One state-wide map service appears to cover most SA councils.
- [ ] **Councils that publish a map service:** Moreton Bay, Wyndham, Sutherland, Parramatta, Newcastle.
- [ ] **Councils with their own lookup:** Sunshine Coast, Casey, Joondalup, City of Sydney, ACT.

[docs/council-candidates.md](docs/council-candidates.md) has the research behind these: about 40 councils, where each publishes its bin days, and how hard each looks.

## Known gaps

- **No Western Australia, South Australia, Tasmania, ACT or Northern Territory** yet.
- **Many large councils block automated requests** to their websites (Logan, Ipswich, Blacktown and others), so they need a different data source.
- **Public holidays.** Dates worked out from a weekly or fortnightly cycle are marked `projected`, because a holiday can shift them.
- **Ambiguous addresses.** Lookups use free OpenStreetMap data, so "10 Bourke St Melbourne" without a postcode can land on the wrong Bourke Street. Adding the postcode fixes it.
- **Properties with no kerbside service** (some rural addresses) return an error rather than a clear "no service here".
