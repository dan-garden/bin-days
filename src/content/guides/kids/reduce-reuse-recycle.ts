import { statePath } from '../../../councils/names.js';
import type { Article } from '../../articles.js';
import { hierarchy, tipCards } from '../../illustrations.js';
import { markdownToHtml as md } from '../../markdown.js';

export const kidsReduceReuseRecycle: Article = {
  path: '/guides/kids/reduce-reuse-recycle',
  title: 'Reduce, reuse, recycle: a guide for kids',
  seoTitle: 'Reduce, reuse, recycle for kids: what it means | Bin Days',
  description:
    'What "reduce, reuse, recycle" really means, why reducing comes first, and easy things kids can do at home and at school, with the slogans Australians grew up with.',
  updated: '2026-11-26',
  parents: [{ name: 'For kids', path: '/guides/kids' }],
  related: ['/guides/kids/which-bin', '/which-bin', '/data/bin-collections'],
  html: [
    md(`
**Reduce, reuse, recycle.** Lots of Australian grown-ups remember learning these three words at school, and they're still the best way to look after the planet. The order matters: the first word is the most important.

## The three Rs, in order

1. **Reduce:** make less rubbish in the first place. Do we need it? Do we need so much?
2. **Reuse:** use things again, or give them to someone who can. Can we use it again?
3. **Recycle:** turn old things into new things. Can it be made into something new?

These questions come from the NSW EPA's guide to the **waste hierarchy**, the order Australian governments use to decide what to do with rubbish. Recycling is great, but it's third on the list, because not making rubbish at all is even better.`),
    hierarchy(
      [
        ['Avoid and reduce', 'Do we need it? Do we need so much?'],
        ['Reuse', 'Can we use it again?'],
        ['Recycle', 'Can it be made into something new?'],
        ['Recover', 'Compost, or energy from waste'],
        ['Landfill', 'The very last choice'],
      ],
      'The waste hierarchy: the best choice is at the top, and landfill is the last resort.',
    ),
    md(`
## More Rs

Some people add more Rs. Keep Australia Beautiful uses six: **Refuse, Rot, Reduce, Reuse, Recycle, Restore**.

- **Refuse:** say "no thanks" to things you don't need, like a plastic straw or a free toy that will break.
- **Rot:** let food scraps and leaves rot into compost, in the [green bin](/which-bin/food-scraps) or a compost heap.
- **Restore:** fix things up and look after the places around you.

In Western Australia, the WasteSorted campaign asks everyone to **"Be a GREAT Sort"**: Gifting, Recycling, Earth-cycling (composting), Avoiding and Taking things to drop-off points.

## Things you can do at home`),
    tipCards([
      [
        'bottle',
        'Take a drink bottle',
        'Fill a reusable bottle instead of buying drinks in plastic.',
      ],
      ['bag', 'Pack a reusable bag', 'Keep one in the car or your school bag.'],
      [
        'box',
        'Make something new',
        'Boxes and tubes make great cubbies, robots and marble runs before they go in recycling.',
      ],
      [
        'shirt',
        'Pass it on',
        'Give clothes, books and toys you have outgrown to a friend or a charity shop.',
      ],
      ['apple', 'Eat it all', 'Only take what you will eat, and put the scraps in compost.'],
      [
        'can',
        'Collect containers',
        'Drink cans and bottles can earn 10 cents each at a refund point.',
      ],
    ]),
    md(`
## Earn 10 cents a can

Every state and territory now pays **10 cents** for most empty drink cans and bottles you take to a refund point. Some families collect them to save up, and lots of schools collect them to raise money. The schemes started at different times:`),
    `<div class="table-scroll"><table><thead><tr><th>State or territory</th><th>Scheme</th><th>Started</th></tr></thead><tbody>${[
      ['SA', 'South Australia', 'Container deposit scheme', '1977, the first in Australia'],
      ['NT', 'Northern Territory', 'Container deposit scheme', '2012'],
      ['NSW', 'New South Wales', 'Return and Earn', 'December 2017'],
      ['ACT', 'ACT', 'ACT container deposit scheme', 'June 2018'],
      ['QLD', 'Queensland', 'Containers for Change', 'November 2018'],
      ['WA', 'Western Australia', 'Containers for Change', '2020'],
      ['VIC', 'Victoria', 'CDS Vic', '1 November 2023'],
      ['TAS', 'Tasmania', 'Recycle Rewards', '1 May 2025'],
    ]
      .map(
        ([code, name, scheme, start]) =>
          `<tr><td>${code === 'NT' ? name : `<a href="${statePath(code as string)}">${name}</a>`}</td><td>${scheme}</td><td>${start}</td></tr>`,
      )
      .join('')}</tbody></table></div>`,
    md(`
In New South Wales alone, people have returned nearly **17 billion** containers through Return and Earn. [Which drink containers earn a refund](/which-bin/container-deposit-scheme)

## Do the right thing

In 1979, the **"Do the Right Thing"** campaign started asking Australians to put their litter in the bin. Its catchy TV ads are still remembered today, and Keep Australia Beautiful brought the campaign back in 2021. Find out more in [Litter and wildlife](/guides/kids/litter-and-wildlife).

## Quick quiz

1. Which of the three Rs is the most important?
2. What does "refuse" mean?
3. How much do you get for returning an empty drink can?

### Answers

1. **Reduce.** Not making rubbish is better than recycling it.
2. **Saying "no thanks"** to things you don't need.
3. **10 cents** in every state and territory.

## Sources

- [NSW EPA: The waste hierarchy](https://www.epa.nsw.gov.au/Your-environment/Recycling-and-reuse/warr-strategy/The-waste-hierarchy)
- [NSW EPA: Glass fact sheet (avoid, reduce, reuse, recycle questions)](https://www.epa.nsw.gov.au/sites/default/files/120354-glass.pdf)
- [Keep Australia Beautiful: Do the Right Thing](https://kab.org.au/?p=5371)
- [WA Government: WasteSorted and "Be a GREAT sort"](https://www.wa.gov.au/government/media-statements/McGowan%20Labor%20Government/New-initiatives-target-improved-waste-behaviours-20200831)
- [Return and Earn](https://returnandearn.org.au/about/), [CDS Vic](https://www.premier.vic.gov.au/victorias-container-deposit-scheme-now-open), [ACT CDS](https://www.actcds.com.au/), [Containers for Change WA](https://www.containersforchange.com.au/wa/about), [Recycle Rewards](https://recyclerewards.com.au/)
- [Container deposit schemes in Australia (Wikipedia)](https://en.wikipedia.org/wiki/Container_deposit_schemes_in_Australia), for the SA, NT and Queensland start dates`),
  ].join('\n'),
};
