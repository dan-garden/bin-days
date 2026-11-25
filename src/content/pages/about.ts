import type { Article } from '../articles.js';

export const about: Article = {
  path: '/about',
  title: 'About Bin Days',
  description:
    'Bin Days is a free, independent site that tells you which bins go out and when, for addresses across Australia, straight from each council.',
  updated: '2026-11-25',
  body: `
## What it does

Type your address and Bin Days finds your council, asks the council's own system about your property, and shows your next bin day, which bins go out, and the weeks after. You can add the dates to your calendar so you never have to look again.

## Where the dates come from

Every council has its own way of publishing bin days: a lookup on its website, a map, a data file or a printed calendar. Bin Days reads each one directly, at the time you ask. It never guesses: if your council isn't covered yet, it says so rather than showing a made-up schedule.

Some dates are marked **est.** Those are worked out from your council's regular cycle (weekly or fortnightly) rather than stated by the council, so a public holiday can move them.

## What it doesn't do

- No ads.
- No tracking, analytics or cookies.
- No account or sign-in.

The [privacy page](/privacy) has the details.

## Open and free

The code is [open source on GitHub](https://github.com/dan-garden/bin-days), and anyone can use the same data through the free [API](/docs), for example in a home automation system. Bin Days is made by [Dan Garden](https://github.com/dan-garden). It isn't run by, or connected to, any council.

## Found something wrong?

If a bin day is wrong, or your council isn't covered, [let us know](/contact).
`,
};
