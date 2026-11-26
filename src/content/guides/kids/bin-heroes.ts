import { statePath } from '../../../councils/names.js';
import type { Article } from '../../articles.js';
import { binRow } from '../../illustrations.js';
import { markdownToHtml as md } from '../../markdown.js';

export const kidsBinHeroes: Article = {
  path: '/guides/kids/bin-heroes',
  title: 'Bin heroes and recycling campaigns around Australia',
  seoTitle: 'Recycling mascots and campaigns by state | Bin Days',
  description:
    'Ask Vin, the GREAT Sorts, Sort-It Sally and the Bincredible Hulk: the characters and campaigns teaching Australians to recycle, state by state.',
  updated: '2026-11-26',
  parents: [{ name: 'For kids', path: '/guides/kids' }],
  related: [
    '/guides/kids/reduce-reuse-recycle',
    '/guides/kids/litter-and-wildlife',
    '/guides/bin-lid-colours',
  ],
  html: [
    md(`
All around Australia, councils and state governments have come up with characters and catchy slogans to help everyone recycle right. Some of the mascots were even **named by school kids**! Here are some of them. Every picture belongs to the people who made it, so follow the links to meet them.`),
    binRow(
      [
        ['red', 'Benjamin Binny'],
        ['yellow', 'Rolanda Recycle'],
        ['lime', 'Georgia Green'],
      ],
      "Gladstone Regional Council's three waste heroes, one for each bin (drawn here as plain bins).",
    ),
    md(`
## Queensland

- **Georgia Green, Benjamin Binny and Rolanda Recycle** are Gladstone Regional Council's "waste heroes": Georgia for the green garden organics bin, Benjamin for the red general waste bin and Rolanda for the yellow recycling bin. Georgia joined in January 2026. [Meet Georgia Green](https://www.gladstone.qld.gov.au/Council/Communications-and-Resources/Latest-news/GO-Bin-mascot) · [Gladstone bin days](/bin-days/qld/gladstone)
- **Sort-It Sally** visits kindies and primary schools on the Southern Downs with the free "Let's sort it out Southern Downs!" program. A student named her in 2021. [Meet Sort-It Sally](https://www.sdrc.qld.gov.au/council/alerts-news-notices/2021-news/2021-june/the-new-face-at-council-sort-it-sally-joins-the-waste-education-team)
- **Containers for Change** gives Queensland schools free bins to collect drink containers for 10 cents each. [Containers for Change schools](https://www.containersforchange.com.au/qld/schools) · [Queensland councils](${statePath('QLD')})

## New South Wales

- **The Bincredible Hulk** is Campbelltown City Council's recycling mascot. Savannah from Minto Public School picked the name in 2025, out of more than 60 ideas. [Meet the Bincredible Hulk](https://www.campbelltown.nsw.gov.au/News/Recycling-Mascot-Name-Announced) · [Campbelltown bin days](/bin-days/nsw/campbelltown)
- **A magpie, a green sea turtle and a blue groper** star in the NSW EPA's anti-litter ads, "fighting back" against people who drop rubbish. [Litter and wildlife](/guides/kids/litter-and-wildlife)
- **Return and Earn** pays 10 cents for drink containers, and has had nearly 17 billion returned. [Return and Earn for schools](https://returnandearn.org.au/get-your-school-involved/) · [NSW councils](${statePath('NSW')})

## South Australia

- **Vin** (or Vinnie) is the star of the **Which Bin** campaign: "Don't know which bin? Ask Vin!" He's a dad working out which bin is which, with his family, in a series of short videos. [Watch Vin's videos](https://recycleright.sa.gov.au/which-bin-campaign) · [Ask Vin on Which Bin](https://www.whichbin.sa.gov.au/)
- **Wipe Out Waste** has taught South Australian kids about rubbish, from preschool to Year 12, since 2006. [Wipe Out Waste](https://wipeoutwaste.com.au/what-is-wow) · [SA councils](${statePath('SA')})
- South Australia started Australia's very first **container refund** in 1977.

## Western Australia

- **The GREAT Sorts** are WasteSorted's characters, one for each part of "Be a GREAT Sort, make landfill the last resort": Gifting, Recycling, Earth-cycling, Avoiding and Taking to drop-offs. [WasteSorted](https://www.wastesorted.wa.gov.au/) · [WA councils](${statePath('WA')})
- **WasteSorted Schools** helps schools cut waste, with grants for schools that join. [WasteSorted Schools](https://www.wastesorted.wa.gov.au/wastesorted-schools/wastesorted-schools-grants)

## Victoria

- Every Victorian council is moving to the **same four lid colours**: red for rubbish, yellow for recycling, lime green for food and garden, and purple for glass. [Victoria's bin colours](https://www.vic.gov.au/standardising-household-recycling-across-victoria) · [Victorian councils](${statePath('VIC')})
- **CDS Vic** started paying 10 cents for drink containers on 1 November 2023. [CDS Vic](https://cdsvic.org.au/)

## ACT

- The **Recyclopaedia** is an A to Z of what goes where, with posters, fact sheets and videos, some in other languages. [ACT Recyclopaedia](https://www.cityservices.act.gov.au/recyclopaedia) · [Canberra bin days](/bin-days/act/canberra)

## Tasmania

- **Recycle Rewards**, Tasmania's 10 cent container refund, started on 1 May 2025, making it the last state to join. [Recycle Rewards](https://recyclerewards.com.au/) · [Tasmanian councils](${statePath('TAS')})

## All around Australia

- **"Do the Right Thing"** (from 1979): Keep Australia Beautiful's famous anti-litter campaign, with a TV jingle many grown-ups can still sing.
- **Clean Up Australia Day** (from 1990): started by Ian Kiernan after 40,000 people cleaned up Sydney Harbour in 1989.
- **National Recycling Week** (from 1996): run by Planet Ark every November, with free lessons for schools through Schools Recycle Right.
- **"Check it! Before you chuck it"**: Planet Ark's reminder to look for the Australasian Recycling Label on packaging before it goes in a bin.

## Make your own bin hero

Lots of these mascots were named or drawn by kids. Why not invent your own? Give your hero a name, pick which bin they look after, and give them a catchphrase, like "Squash it flat!" or "Keep it loose!" Then share your hero with your class, or with your council: they might be looking for one.

## Sources

Every character and campaign above links to the council, government or organisation that runs it. Dates are from those pages, and from [Keep Australia Beautiful](https://kab.org.au/?p=8), [Clean Up Australia](https://www.cleanup.org.au/about-us/), [Planet Ark](https://planetark.com/programs/national-recycling-week), [Mumbrella (Check it! Before you chuck it)](https://mumbrella.com.au/planet-arc-urges-consumers-to-check-it-before-you-chuck-it-in-recycling-awareness-campaign-649041) and [Green Industries SA](https://www.greenindustries.sa.gov.au/resources/which-bin-market-research-summary-2020-).`),
  ].join('\n'),
};
