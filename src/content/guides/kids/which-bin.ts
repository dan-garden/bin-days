import type { Article } from '../../articles.js';
import { binRow, binWith, quizCards, tipCards, truckScene, yesNo } from '../../illustrations.js';
import { markdownToHtml as md } from '../../markdown.js';

const ACT = 'https://www.cityservices.act.gov.au/recyclopaedia';
const SA = 'https://www.whichbin.sa.gov.au/a-z-items';
const FOGO =
  'https://www.epa.nsw.gov.au/Your-environment/Recycling-and-reuse/household-recycling-overview/what-can-go-in-your-fogo-bin';

export const kidsWhichBin: Article = {
  path: '/guides/kids/which-bin',
  title: 'Which bin? A guide for kids',
  seoTitle: 'Which bin does it go in? A recycling guide for kids | Bin Days',
  description:
    'Red, yellow, green and purple: what each wheelie bin is for, what goes in and what stays out, with pictures, tips and a quiz for kids and grown-ups.',
  updated: '2026-11-26',
  related: ['/which-bin', '/guides/bin-lid-colours', '/data/bin-collections'],
  parents: [{ name: 'For kids', path: '/guides/kids' }],
  html: [
    truckScene('yellow', 'A bin truck lifting a recycling bin with its robot arm.'),
    md(`
Every week, a big truck comes down your street and picks up the wheelie bins with a robot arm. Each bin has a different coloured lid, and each colour is for different things. When everything goes in the right bin, more of it can be made into something new.

Most homes in Australia have **three bins**, and some have four. Here's what each one is for.`),
    binRow(
      [
        ['red', 'General waste'],
        ['yellow', 'Recycling'],
        ['lime', 'Garden (and food)'],
        ['purple', 'Glass'],
      ],
      'The four usual bin lids in Australia. Not every home has all four.',
    ),
    md(`
## The red lid: general waste

The red bin is for things that can't be recycled or composted. It goes to **landfill**, a huge hole in the ground where rubbish is buried. Landfill fills up, so the less we put in the red bin, the better.

**Goes in:** chip packets and lolly wrappers, [nappies](/which-bin/nappies), [takeaway coffee cups](/which-bin/coffee-cups), [broken plastic toys](/which-bin/plastic-toys), [tissues](/which-bin/tissues-and-paper-towel).`),
    binWith(
      'red',
      [
        ['chips', 'Chip packets'],
        ['nappy', 'Nappies'],
        ['cup', 'Coffee cups'],
      ],
      'Things that go in the red general waste bin.',
    ),
    md(`
## The yellow lid: recycling

The yellow bin is for things that can be **made into new things**: [plastic bottles](/which-bin/plastic-bottles), [cans](/which-bin/aluminium-cans), cardboard boxes (even [pizza boxes](/which-bin/pizza-boxes)), paper, [egg cartons](/which-bin/egg-cartons), and [glass jars and bottles](/which-bin/glass-bottles-and-jars) (unless you have a purple glass bin).

**Three recycling rules to remember:**`),
    tipCards([
      ['rinse', '1. Empty it', 'Tip out drinks and scrape out food.'],
      [
        'bag',
        '2. Keep it loose',
        "Never put recycling in a plastic bag. The sorting machines can't open bags.",
      ],
      ['flat', '3. Squash it flat', 'Flatten boxes, and lots more fits in the bin.'],
    ]),
    md(`[Why plastic bags and soft plastics stay out](/which-bin/soft-plastics)`),
    yesNo(
      [
        ['bottle', 'plastic bottles'],
        ['can', 'cans'],
        ['box', 'cardboard boxes'],
        ['paper', 'paper'],
      ],
      [
        ['bag', 'plastic bags'],
        ['battery', 'batteries'],
        ['nappy', 'nappies'],
      ],
      'What goes in the yellow recycling bin, and what stays out.',
    ),
    md(`
## The green lid: garden waste (and sometimes food)

The green bin (usually lime green) is for **things that grow**: [grass clippings, leaves](/which-bin/garden-waste), flowers, weeds and small branches. They're turned into **compost**, a rich soil that helps farms and gardens grow more plants.

Lots of councils now let you put [food scraps](/which-bin/food-scraps) in the green bin too, like banana peels, apple cores and leftovers. This is called **FOGO**, short for Food Organics, Garden Organics. Ask a grown-up whether your council does FOGO before you put food in. [Which councils take food scraps](/guides/fogo-and-glass-bins)`),
    binWith(
      'lime',
      [
        ['leaf', 'Leaves'],
        ['apple', 'Apple cores'],
        ['banana', 'Banana peels'],
      ],
      'Garden waste goes in the green bin. Food scraps too, if your council does FOGO.',
    ),
    md(`
## The purple lid: glass

Some councils, [mostly in Victoria](/bin-days/vic), have a fourth bin with a **purple lid just for glass** bottles and jars. Keeping glass separate stops broken glass getting mixed up with paper and cardboard, so more of everything can be recycled. If you don't have a purple bin, glass bottles and jars go in the yellow recycling bin.`),
    binWith(
      'purple',
      [
        ['jar', 'Glass jars'],
        ['bottle', 'Glass bottles'],
      ],
      'Glass bottles and jars go in the purple bin, if you have one.',
    ),
    md(`
## Things that don't go in any bin

Some things are too dangerous, or too useful, to go in a bin:

- **Batteries** can spark and start fires inside the bin truck. Take them to a battery drop-off box, like the ones at many supermarkets. [More about batteries](/which-bin/batteries)
- **Old phones, tablets and computers** have precious metals inside that can be used again. [Where e-waste goes](/which-bin/e-waste)
- **Clothes and toys** that are still good can be given to a charity shop or a friend. [Clothes and textiles](/which-bin/clothes-and-textiles)
- **Soft plastics** like bread bags and chip packets can't go in the yellow bin. [Soft plastics](/which-bin/soft-plastics)

## Quick quiz

Which bin would you use? (Answers below.)`),
    quizCards(
      [
        ['milk', 'Milk bottle'],
        ['banana', 'Banana peel'],
        ['box', 'Cereal box'],
        ['tissue', 'Used tissue'],
        ['battery', 'Battery'],
      ],
      'Five things to sort. Which bin does each one go in?',
    ),
    md(`
1. An empty milk bottle
2. A banana peel
3. A cardboard cereal box
4. A used tissue
5. An old remote control battery

### Answers

1. **Yellow recycling.** Rinse it first. ([Plastic bottles](/which-bin/plastic-bottles))
2. **Green**, if your council takes food scraps. If not, red, or your compost at home. ([Food scraps](/which-bin/food-scraps))
3. **Yellow recycling.** Flatten it first.
4. **Red general waste.** ([Tissues](/which-bin/tissues-and-paper-towel))
5. **None of them!** Take it to a battery drop-off. ([Batteries](/which-bin/batteries))

## For grown-ups

Every council is a little different. [Look up your address](/) to see exactly which bins your home has and which ones go out this week, or look up a tricky item in [Which bin does it go in?](/which-bin). [What each lid colour means](/guides/bin-lid-colours) explains the colours in more detail.

## Sources

- [ACT Recyclopaedia](${ACT})
- [Green Industries SA: Which Bin A–Z](${SA})
- [NSW EPA: What can go in your FOGO bin](${FOGO})`),
  ].join('\n'),
};
