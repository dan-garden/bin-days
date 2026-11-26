import type { Article } from '../../articles.js';
import { tipCards } from '../../illustrations.js';
import { markdownToHtml as md } from '../../markdown.js';

export const kidsLitterAndWildlife: Article = {
  path: '/guides/kids/litter-and-wildlife',
  title: 'Litter and wildlife: why every bit counts',
  seoTitle: 'Litter and wildlife for kids: how to help | Bin Days',
  description:
    'How litter reaches the ocean and hurts turtles, seabirds and other animals, the story of Clean Up Australia, and simple ways kids can help.',
  updated: '2026-11-26',
  parents: [{ name: 'For kids', path: '/guides/kids' }],
  related: [
    '/guides/kids/reduce-reuse-recycle',
    '/which-bin/batteries',
    '/which-bin/soft-plastics',
  ],
  html: [
    md(`
**Litter** is rubbish left where it doesn't belong: on the footpath, in the park, at the beach. Wind and rain wash it into drains, and most drains lead to creeks, rivers and the sea. A chip packet dropped in the street can end up in the ocean.

## How litter hurts animals

- **Seabirds** often mistake floating plastic for food. Scientists at CSIRO found that nearly **60% of seabird species** have eaten plastic.
- **Turtles** can mistake plastic bags for jellyfish. CSIRO says about **one in three sea turtles** around the world has probably eaten rubbish.
- **Animals get tangled** in fishing line, string and plastic rings.

Most of the rubbish on Australia's beaches comes from Australia, and there's more of it near cities. That means we can fix it!

## A turtle called Andrew

Andrew was a tiny green sea turtle hatchling who ate a piece of litter. He spent 16 months being cared for at Taronga Zoo's Wildlife Hospital in Sydney before he was well again. [Read about Taronga's Litter Free Oceans](https://taronga.org.au/litter-free-oceans/)

## The day 40,000 people cleaned up Sydney Harbour

In 1989, a sailor called **Ian Kiernan** was tired of seeing rubbish in the ocean. He and some friends organised **"Clean Up Sydney Harbour"**. They expected a few hundred helpers, and about **40,000 people** turned up! The next year it became **Clean Up Australia Day**, and it still happens every year, with thousands of schools joining in. [Join Clean Up Australia](https://www.cleanup.org.au/schools/)

## Do the Right Thing

Ask a grown-up if they remember the **"Do the Right Thing"** ads. The campaign started in 1979 to get Australians to put litter in the bin, and its TV jingle is still stuck in lots of heads today. Keep Australia Beautiful brought it back in 2021.

## How you can help`),
    tipCards([
      ['chips', 'Bin it', "If there's no bin nearby, take your rubbish home."],
      [
        'bag',
        'Pick up three',
        'Pick up three bits of litter when you leave the beach or park (with a grown-up, and gloves).',
      ],
      [
        'bottle',
        'Go reusable',
        'Reusable drink bottles and lunch boxes mean less rubbish to drop.',
      ],
      [
        'battery',
        'Drop off batteries',
        'Batteries in bins can start fires. Take them to a drop-off point.',
      ],
    ]),
    md(`
## Batteries start fires

Batteries aren't litter, but they're dangerous in the wrong bin. In Western Australia, batteries start at least **three fires a week** in bin trucks and recycling centres. If the ends (terminals) touch, they can spark, so put sticky tape over them and take them to a battery drop-off box. [Where batteries go](/which-bin/batteries)

## Quick quiz

1. Where do most street drains lead?
2. What do turtles sometimes mistake plastic bags for?
3. Who started Clean Up Australia?

### Answers

1. **Creeks, rivers and the sea.**
2. **Jellyfish.**
3. **Ian Kiernan**, after cleaning up Sydney Harbour in 1989.

## For grown-ups

Litter campaigns differ by state. In New South Wales, the EPA's current campaign, "Nature Hates a Tosser", stars an Australian magpie, a green sea turtle and an eastern blue groper (the state fish), following the earlier "Hey Tosser!" (2014) and "Don't be a Tosser!" (2018). Schools can adopt a stretch of beach with Tangaroa Blue, whose marine debris teaching kit is free to share. More in [Resources for parents and teachers](/guides/kids/resources-for-parents-and-teachers).

## Sources

- [CSIRO: Plastic in seabirds](https://www.csiro.au/en/news/all/news/2015/september/marine-debris)
- [CSIRO: Plastic on the coasts is ours](https://www.csiro.au/en/news/all/news/2014/september/plastic-on-the-coasts-is-ours)
- [Taronga: Litter Free Oceans](https://taronga.org.au/litter-free-oceans/)
- [Clean Up Australia: About us](https://www.cleanup.org.au/about-us/)
- [Keep Australia Beautiful: Do the Right Thing](https://kab.org.au/?p=5371)
- [WasteSorted: Battery fires](https://www.wastesorted.wa.gov.au/blog/I-feared-for-my-life-waste-workers-call-for-action-as-battery-fire-risks-surge) and [B-cycle](https://bcycle.com.au/)
- [NSW Government: Nature Hates a Tosser FAQ](https://www.nsw.gov.au/environment-land-and-water/environmental-protection-waste-and-recycling/nature-hates-a-tosser/campaign/faq)
- [Tangaroa Blue: Schools](https://tangaroablue.org/school-collaboration)`),
  ].join('\n'),
};
