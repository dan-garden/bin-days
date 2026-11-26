import type { Article } from '../../articles.js';
import { journey, tipCards } from '../../illustrations.js';
import { markdownToHtml as md } from '../../markdown.js';

const BRISBANE =
  'https://brisbane.qld.gov.au/content/dam/brisbanecitycouncil/corpwebsite/bins-waste-and-recycling/documents';

export const kidsWhereRubbishGoes: Article = {
  path: '/guides/kids/where-does-rubbish-go',
  title: 'Where does your rubbish go?',
  seoTitle: 'Where does rubbish go? A guide for kids | Bin Days',
  description:
    'Follow each bin after the truck takes it away: the recycling sorting centre with its magnets and robot eyes, compost for farms, and landfill.',
  updated: '2026-11-26',
  parents: [{ name: 'For kids', path: '/guides/kids' }],
  related: ['/guides/kids/which-bin', '/which-bin', '/guides/bin-lid-colours'],
  html: [
    md(`
When the bin truck tips your bin in and drives away, where does it all go? Each bin goes somewhere different. Let's follow them.

## The yellow bin: off to the sorting centre`),
    journey(
      [
        ['home', 'Your bin', 'Bottles, cans, paper and boxes, loose.'],
        ['truck', 'The truck', 'Squashes it all and drives to the sorting centre.'],
        ['sort', 'Sorting centre', 'Magnets, air and robot eyes sort everything.'],
        ['factory', 'Factories', 'Melt, mash and remake each material.'],
        ['new', 'New things', 'New bottles, cans, boxes and paper.'],
      ],
      'The journey of the yellow recycling bin.',
    ),
    md(`
The recycling goes to a **materials recovery facility**, or **MRF** (people say "murf"). It's like a giant machine with conveyor belts running everywhere. Brisbane's has more than a kilometre of them! Here's how it sorts your recycling:

1. **People pick out the wrong things** first, like plastic bags, nappies and food. That's why the [which bin rules](/guides/kids/which-bin) matter.
2. **Spinning screens** bounce flat paper and cardboard one way, while bottles and cans roll the other.
3. **A giant magnet** pulls out steel cans, like food tins.
4. **An eddy current** is a special magnetic field that makes aluminium cans jump off the belt by themselves.
5. **Optical sorters** are like robot eyes. They spot each kind of plastic and puff it into the right place with a blast of air.
6. **Glass** goes to its own plant, where it's sorted into clear, green and brown.
7. Everything is **squashed into big blocks** called bales and sent to factories to be made into new things.

The Sunshine Coast's MRF sorts about 60,000 tonnes of recycling a year, with more than 60 conveyors and robots checking the work. [Sunshine Coast bin days](/bin-days/qld/sunshine-coast)

## What recycling becomes`),
    tipCards([
      [
        'can',
        'Cans',
        'Aluminium can be recycled again and again. A can could be back on the shelf in as little as about 60 days.',
      ],
      [
        'jar',
        'Glass',
        'Most new glass made in Australia is 40% to 70% recycled glass. Crushed glass can even help build roads.',
      ],
      [
        'paper',
        'Paper',
        'Paper can be recycled about 4 to 8 times, into new paper, egg cartons and cardboard.',
      ],
      ['box', 'Cardboard', 'Most cardboard boxes are made from recycled paper.'],
    ]),
    md(`
## The green bin: compost for farms`),
    journey(
      [
        ['home', 'Your bin', 'Grass, leaves and (with FOGO) food scraps.'],
        ['truck', 'The truck', 'Takes it to a composting site.'],
        ['compost', 'Compost', 'Tiny living things break it down into rich soil.'],
        ['farm', 'Farms and gardens', 'Compost helps new plants grow.'],
      ],
      'The journey of the green organics bin.',
    ),
    md(`
Garden waste and food scraps are piled up and turned so that tiny living things (microbes) can break them down. A few weeks later, they've become **compost**, which farmers and gardeners spread on the soil to help plants grow. Compost can help some crops grow up to 40% more in dry, warm places like much of Australia.

In South Australia, the **Which Bin** videos follow Vin, a dad who's working out which bin is which. In one episode he visits a South Australian farm to see food scraps become compost. [Watch the Which Bin videos](https://recycleright.sa.gov.au/which-bin-campaign)

## The red bin: landfill`),
    journey(
      [
        ['home', 'Your bin', "Things that can't be recycled or composted."],
        ['truck', 'The truck', 'Takes it to landfill.'],
        ['landfill', 'Landfill', 'Buried in a huge lined hole in the ground.'],
      ],
      'The journey of the red general waste bin.',
    ),
    md(`
**Landfill** is a giant hole in the ground, lined so that nothing leaks out, where rubbish is spread out, squashed and covered with soil. Once it's buried, it stays there for a very long time.

Food is the big problem in landfill. With no air down there, rotting food makes **methane**, a gas that heats up the planet. In a compost heap there's plenty of air, so food breaks down without making methane. That's why so many councils now collect [food scraps in the green bin](/guides/fogo-and-glass-bins).

## How much rubbish do we make?

In 2022–23, each Australian made about **2.88 tonnes** of waste in a year (counting homes, businesses and building sites). That's about as heavy as two small cars, for every person! Two-thirds of it (66%) was recovered by recycling, composting or making energy, and Australia wants that to reach 80% by 2030.

## See it for yourself

Some councils run free tours of their recycling centres. Fraser Coast Regional Council's Maryborough MRF has a viewing room where you can watch the sorting line working, and tours are open to all ages. [Fraser Coast bin days](/bin-days/qld/fraser-coast)

## Quick quiz

1. What does MRF stand for?
2. How does the MRF pull out steel cans?
3. Why is food bad for landfill?

### Answers

1. **Materials recovery facility**, the recycling sorting centre.
2. **With a giant magnet.**
3. **It makes methane**, a gas that heats the planet, when it rots without air.

## Sources

- [Brisbane City Council: What happens to your recycling?](${BRISBANE}/what-happens-to-your-recycling-fact-sheet.pdf.coredownload.pdf) ([Brisbane bin days](/bin-days/qld/brisbane))
- [Brisbane City Council: Aluminium fact sheet](${BRISBANE}/recycling-materials-fact-sheet-aluminium.pdf.coredownload.pdf) and [Glass fact sheet](${BRISBANE}/recycling-materials-fact-sheet-glass.pdf.coredownload.pdf)
- [Sunshine Coast Council: Meet MuRF, our recycling wonder](https://www.sunshinecoast.qld.gov.au/news/getting-it-sorted-meet-murf-our-recycling-wonder)
- [Planet Ark RecyclingNearYou: Office paper](https://recyclingnearyou.com.au/office-paper)
- [The Conversation: The case for compost](https://theconversation.com/the-case-for-compost-why-recycling-food-waste-is-so-much-better-than-sending-it-to-landfill-205583)
- [ABS: Circular economy](https://www.abs.gov.au/statistics/measuring-what-matters/measuring-what-matters-themes-and-indicators/sustainable/circular-economy)
- [Fraser Coast Regional Council: Free recycling tours](https://www.frasercoast.qld.gov.au/About-Council/Stay-Informed/News/Discover-the-power-of-recycling-at-free-public-tours)`),
  ].join('\n'),
};
