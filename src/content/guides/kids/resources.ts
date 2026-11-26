import { statePath } from '../../../councils/names.js';
import type { Article } from '../../articles.js';
import { markdownToHtml as md } from '../../markdown.js';

export const kidsResources: Article = {
  path: '/guides/kids/resources-for-parents-and-teachers',
  title: 'Recycling resources for parents and teachers',
  seoTitle: 'Free recycling lessons for schools, by state | Bin Days',
  description:
    'Free lesson plans, school programs, videos and recycling centre tours for teaching kids about bins and recycling, in every Australian state.',
  updated: '2026-11-26',
  parents: [{ name: 'For kids', path: '/guides/kids' }],
  related: ['/which-bin', '/data/bin-collections', '/guides/bin-lid-colours'],
  html: md(`
These free programs and materials come from Australian governments, councils and non-profits. Most are made for schools, and plenty work just as well at home. Our own kids' guides are free to read and share, too: start with [Which bin? A guide for kids](/guides/kids/which-bin).

## Free to adapt and share

Two collections are openly licensed, so you can adapt and share them, as long as you credit the makers:

- **[Waste Education Queensland](https://wasteeducation-qld.org/)**: lessons from Kindy to Year 10, under a Creative Commons Attribution licence.
- **[Tangaroa Blue's marine debris kit](https://tangaroablue.org/school-collaboration)**: from early primary to Year 10, free to download, print and share. Schools can also adopt a local beach to monitor and clean.

## Australia-wide

- **[Planet Ark: Schools Recycle Right](https://recyclingnearyou.com.au/schools-recycle-right)**: free lesson plans on reducing, reusing and recycling, from Early Learning to Year 10, with activity guides. It runs with **National Recycling Week** every November.
- **[Clean Up Australia: Education hub](https://www.cleanup.org.au/education-hub/)**: an educator's guide and lesson plans, and [free Clean Up kits for schools](https://www.cleanup.org.au/schools/) with bags and gloves.
- **[Keep Australia Beautiful: Education](https://kab.org.au/education/)**: Eco-Schools (in NSW and the NT) and the Paint Australia Beautiful mural competition.
- **[Cool.org: National Recycling Week lessons](https://cool.org/national-recycling-week-education-resources)** and the **[War on Waste unit for Years 4–6](https://cool.org/unit/war-on-waste-years-4-6)**.
- **[B-cycle](https://bcycle.com.au/)**: find a battery drop-off near you, and learn why batteries need taping.
- **[Taronga: Litter Free Oceans](https://taronga.org.au/litter-free-oceans/)**: a true turtle story and easy swaps for families.

## By state and territory

### New South Wales

- **[Sustainable Schools NSW](https://aaeensw.org.au/sustainable-schools/)**, run by EE NSW since 2017.
- **[NSW Department of Education: Waste](https://education.nsw.gov.au/teaching-and-learning/curriculum/sustainability/teaching-and-learning/waste.html)**: a waste handbook and units for Years 3–6 and 7–10.
- **[Return and Earn for schools](https://returnandearn.org.au/get-your-school-involved/)**: free curriculum-linked lessons, and fundraising with 10 cent refunds.
- [Bin days for NSW councils](${statePath('NSW')})

### Victoria

- **ResourceSmart Schools**: free for every Victorian school. It moved from Sustainability Victoria to the state's environment department (DEECA) in 2026, so search for its current page.
- **[CDS Vic](https://cdsvic.org.au/)**: container refunds, with an award category in the ResourceSmart Schools Awards.
- **[Victoria's four bin colours](https://www.vic.gov.au/standardising-household-recycling-across-victoria)**, explained.
- [Bin days for Victorian councils](${statePath('VIC')})

### Queensland

- **[Waste Education Queensland](https://wasteeducation-qld.org/)**: openly licensed lessons (see above).
- **[Containers for Change: Schools](https://www.containersforchange.com.au/qld/schools)**: free bins and collection for school container drives.
- **[Reduce food waste at school](https://www.qld.gov.au/environment/waste-reduction-recycling/reduction/reduce-food-waste/at-school)**: links to EcoMarines and Organics Waste Smart Schools grants.
- **[Fraser Coast recycling tours](https://www.frasercoast.qld.gov.au/About-Council/Stay-Informed/News/Discover-the-power-of-recycling-at-free-public-tours)**: free tours of the Maryborough sorting centre, for all ages.
- [Bin days for Queensland councils](${statePath('QLD')})

### South Australia

- **[Wipe Out Waste](https://wipeoutwaste.com.au/what-is-wow)**: KESAB's program for preschool to Year 12, running since 2006.
- **[Which Bin](https://www.whichbin.sa.gov.au/)**: look up any item, and watch [Vin's videos](https://recycleright.sa.gov.au/which-bin-campaign).
- [Bin days for SA councils](${statePath('SA')})

### Western Australia

- **[WasteSorted Schools](https://www.wastesorted.wa.gov.au/wastesorted-schools/wastesorted-schools-grants)** (formerly Waste Wise Schools): accreditation, resources and grants.
- **[Recycle Right WA](https://recycleright.wa.gov.au/)**: which bin by council, and a FOGO sorting game.
- **[Keep Australia Beautiful WA campaigns](https://www.wa.gov.au/organisation/keep-australia-beautiful-wa/keep-australia-beautiful-campaigns)**.
- [Bin days for WA councils](${statePath('WA')})

### ACT

- **[Sustainable Schools Program](https://www.climatechoices.act.gov.au/schools-program)**: free for all ACT schools, with a waste module.
- **[Recyclopaedia](https://www.cityservices.act.gov.au/recyclopaedia)**: posters, fact sheets and videos, some in other languages.
- [Canberra bin days](/bin-days/act/canberra)

### Tasmania

- **[Schools and education programs](https://wrr.tas.gov.au/action-on-waste-and-resource-recovery/schools-and-education-programs)** funded by the Waste and Resource Recovery Board, with Landcare Tasmania, OzHarvest and others.
- **[Recycle Rewards](https://recyclerewards.com.au/)**: Tasmania's 10 cent container refund.
- [Bin days for Tasmanian councils](${statePath('TAS')})

### Northern Territory

- **[City of Darwin waste education](https://www.darwin.nt.gov.au/form/waste-recycling-education-sessio)**: book a Shoal Bay waste education session, bus tour or school incursion.

## Activity ideas

- **Bin audit:** with gloves on, tip out a day's classroom or kitchen bin and sort it. How much could have been recycled or composted?
- **Sorting relay:** use clean packaging and race to put each item in the right coloured box. Our [which bin pages](/which-bin) have the answers.
- **Lid colour hunt:** on bin night, count the lid colours in your street. Does your street have a purple glass bin? Compare with the [Australian bin data](/data/bin-collections).
- **Invent a bin hero:** design a mascot for one of the bins, like the ones in [Bin heroes around Australia](/guides/kids/bin-heroes).
- **Container drive:** collect drink containers to raise money at 10 cents each.

Links were checked on 26 November 2026. Programs and dates change, so check each organisation's page for the latest.`),
};
