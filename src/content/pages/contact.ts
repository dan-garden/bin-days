import type { Article } from '../articles.js';

const ISSUES = 'https://github.com/dan-garden/bin-days/issues';

export const contact: Article = {
  path: '/contact',
  title: 'Contact',
  description:
    'Report a wrong bin day, ask for your council to be added, or suggest an improvement to Bin Days.',
  updated: '2026-11-25',
  body: `
Bin Days is run in the open, on GitHub. The quickest way to reach us is to [open an issue](${ISSUES}/new). You'll need a free GitHub account.

## A bin day is wrong

Tell us the address (or just the street and suburb), your council, what Bin Days showed and what actually happened. A photo of your council's calendar helps.

## Your council isn't covered

Tell us the council and, if you know it, the page on its website where you look up your bin day. [See which councils are covered](/#coverage).

## Anything else

Ideas, problems with the site or questions about the [API](/docs) are all welcome. You can also see [what's being worked on](${ISSUES}).

Bin Days isn't run by any council, so we can't book collections or replace bins. For those, contact your council directly; each council's page here links to its website.
`,
};
