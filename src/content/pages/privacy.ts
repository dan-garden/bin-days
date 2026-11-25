import type { Article } from '../articles.js';

export const privacy: Article = {
  path: '/privacy',
  title: 'Privacy',
  description:
    'Bin Days has no ads, no tracking and no accounts. This page says exactly what happens to the address you type.',
  updated: '2026-11-25',
  body: `
## The short version

Bin Days has no ads, no analytics, no cookies and no accounts. It doesn't know who you are. To find your bin day it has to use your address, and this page says where that goes.

## When you look up an address

1. Your address is sent to [OpenStreetMap's Nominatim service](https://nominatim.org) to place it on a map, and the location to the Australian Bureau of Statistics' boundary service to find your council.
2. Your address is sent to your council's own system (or the service the council uses) to get your bin days.
3. The answers are kept in our cache so the next lookup is quick and doesn't trouble the council again: the map location for 30 days, your property's bin days for up to 7 days, and the council area for 90 days. These are stored against the address, not against you.

Like most websites, our host keeps short-lived logs of the pages requested, which include the address in a lookup.

## In your browser

- Your browser remembers the last address you looked up, so it's there next time. It stays on your device, and pressing the clear button in the address box removes it.
- Your choice of light or dark theme is remembered the same way.
- The maps on council pages load from [OpenFreeMap](https://openfreemap.org), which sees your internet address as with any website.

## Calendar feeds and shared links

The calendar feed and the share link both contain the address in the link itself. If you add the feed to a calendar, your calendar app (for example Google Calendar) fetches it regularly. Anyone you give either link to can see that address.

## Questions

[Get in touch](/contact) if anything here is unclear.
`,
};
