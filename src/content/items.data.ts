// Researched 2026-11-26. Each item cites where its answer comes from.
const ACT = 'ACT Recyclopaedia';
const RNY = 'Planet Ark RecyclingNearYou';
const SA = 'Green Industries SA Which Bin';
const NSW_FOGO = 'NSW EPA: What can and can’t go in your FOGO bin';

export const ITEM_DATA = [
  {
    slug: 'pizza-boxes',
    name: 'Pizza boxes',
    bin: 'recycling',
    answer:
      'Empty pizza boxes go in the recycling bin. Scrape out leftover food first; a little grease is fine in most areas.',
    prepare: ['Remove leftover food, crusts and cheese', 'Flatten the box'],
    varies:
      'Some councils with a food and garden organics (FOGO) bin, such as those in South Australia, ask you to put greasy, food-stained boxes in the green organics bin. NSW FOGO rules do not allow pizza boxes in the FOGO bin.',
    sources: [
      { name: ACT, url: 'https://www.cityservices.act.gov.au/recyclopaedia/items/p/pizza-boxes' },
      { name: SA, url: 'https://www.whichbin.sa.gov.au/tips/green-bin-greasy-pizza-boxes' },
      {
        name: NSW_FOGO,
        url: 'https://www.epa.nsw.gov.au/Your-environment/Recycling-and-reuse/household-recycling-overview/what-can-go-in-your-fogo-bin',
      },
    ],
  },
  {
    slug: 'batteries',
    name: 'Batteries',
    bin: 'none',
    answer:
      'Batteries never go in any household bin. They can spark and start fires in garbage trucks and recycling plants, even when they seem flat.',
    prepare: ['Put sticky tape over the terminals (both sides of button batteries)'],
    dropOff:
      'Take household batteries (AA, AAA, C, D, 9V, button and rechargeable) to a free B-cycle drop-off point, found at many supermarkets and hardware stores. Devices with built-in batteries go to e-waste drop-off.',
    sources: [
      { name: RNY, url: 'https://recyclingnearyou.com.au/material/home/batteries-single-use' },
      {
        name: ACT,
        url: 'https://www.cityservices.act.gov.au/recyclopaedia/items/b/batteries-household',
      },
    ],
  },
  {
    slug: 'soft-plastics',
    name: 'Soft plastics (plastic bags and wrappers)',
    bin: 'none',
    answer:
      'Soft plastics, anything you can scrunch in your hand, do not go in the recycling bin. Take clean, dry soft plastics to a supermarket drop-off; if you have none nearby, put them in the general waste bin.',
    prepare: ['Make sure they are empty, clean and dry'],
    varies:
      'The REDcycle supermarket program closed in November 2022. Some councils run their own soft plastics services, such as Curby in Central Coast and Newcastle (NSW), so check with yours.',
    dropOff:
      'As of November 2026, more than 700 Woolworths supermarkets and some Coles stores collect household soft plastics in store.',
    sources: [
      { name: RNY, url: 'https://recyclingnearyou.com.au/material/home/soft-plastics' },
      {
        name: 'Woolworths Group (12 November 2026)',
        url: 'https://woolworthsgroup.com.au/au/en/our-newsroom/media-releases/latest-news/2026/national-recycling-week.html',
      },
    ],
  },
  {
    slug: 'coffee-cups',
    name: 'Takeaway coffee cups',
    bin: 'general',
    answer:
      'Takeaway coffee cups and their lids go in the general waste bin. Most cups have a plastic lining that recycling plants cannot separate.',
    varies:
      'In South Australia, cups certified compostable (AS 4736 logo) can go in the green organics bin if your council has one. The ACT and NSW FOGO rules do not accept them.',
    sources: [
      {
        name: ACT,
        url: 'https://www.cityservices.act.gov.au/recyclopaedia/items/d/disposable-coffee-cups',
      },
      { name: SA, url: 'https://www.whichbin.sa.gov.au/a-z-items' },
    ],
  },
  {
    slug: 'glass-bottles-and-jars',
    name: 'Glass bottles and jars',
    bin: 'recycling',
    answer:
      'Glass bottles and jars go in the recycling bin, or in the purple-lid glass bin if your council has one. Put them in loose, not in a bag.',
    prepare: ['Empty and scrape them out', 'Take the lids off', 'Never bag them'],
    varies:
      'Many Victorian councils have a purple-lid glass bin; where you have one, all glass bottles and jars go in it and none go in the yellow bin. Drink bottles may earn a 10c refund through your state’s container deposit scheme.',
    sources: [
      {
        name: ACT,
        url: 'https://www.cityservices.act.gov.au/recyclopaedia/items/g/glass-bottles-and-jars',
      },
      {
        name: 'Surf Coast Shire: Glass-only bin',
        url: 'https://www.surfcoast.vic.gov.au/Property/Waste-and-recycling/Kerbside-bins/GLASS-only-bin',
      },
    ],
  },
  {
    slug: 'aluminium-cans',
    name: 'Aluminium cans',
    bin: 'recycling',
    answer:
      'Aluminium and steel cans go in the recycling bin. Drink cans can also earn a 10c refund through your state’s container deposit scheme.',
    prepare: ['Empty them'],
    sources: [
      {
        name: ACT,
        url: 'https://www.cityservices.act.gov.au/recyclopaedia/items/m/metal-packaging',
      },
      {
        name: 'ACT Container Deposit Scheme',
        url: 'https://www.cityservices.act.gov.au/recycling-and-waste/drop-off/container-deposit-scheme',
      },
    ],
  },
  {
    slug: 'aerosol-cans',
    name: 'Aerosol cans',
    bin: 'recycling',
    answer:
      'Empty aerosol cans, like deodorant, fly spray and cooking oil spray, go in the recycling bin. Cans that are not empty go to a household chemical drop-off.',
    prepare: ['Use it until it is completely empty', 'Take the plastic lid off'],
    varies:
      'Gas cans for camping stoves and barbecues (butane or propane) are hazardous and do not go in any household bin.',
    dropOff: 'Part-full cans and camping gas cans go to a household hazardous waste drop-off.',
    sources: [
      { name: ACT, url: 'https://www.cityservices.act.gov.au/recyclopaedia/items/a/aerosol-cans' },
      { name: SA, url: 'https://www.whichbin.sa.gov.au/a-z-items' },
    ],
  },
  {
    slug: 'nappies',
    name: 'Nappies',
    bin: 'general',
    answer:
      'Nappies go in the general waste bin, including ones sold as biodegradable or compostable.',
    sources: [
      { name: ACT, url: 'https://www.cityservices.act.gov.au/recyclopaedia/items/n/nappies' },
      { name: SA, url: 'https://www.whichbin.sa.gov.au/a-z-items' },
    ],
  },
  {
    slug: 'food-scraps',
    name: 'Food scraps',
    bin: 'organics',
    answer:
      'If your council collects food in the lime-green FOGO bin, put food scraps there, including meat, bones and dairy. If your green bin is for garden waste only, food goes in the general waste bin.',
    prepare: [
      'Put them in loose, wrapped in newspaper, or in a certified compostable caddy liner (AS 4736)',
      'Never use plastic bags',
    ],
    varies:
      'Not every council has a FOGO service yet, and some green bins take garden waste only. Check what your green bin accepts before adding food.',
    sources: [
      {
        name: NSW_FOGO,
        url: 'https://www.epa.nsw.gov.au/Your-environment/Recycling-and-reuse/household-recycling-overview/what-can-go-in-your-fogo-bin',
      },
      { name: ACT, url: 'https://www.cityservices.act.gov.au/recyclopaedia/items/f/food-waste' },
    ],
  },
  {
    slug: 'garden-waste',
    name: 'Garden waste and grass clippings',
    bin: 'organics',
    answer:
      'Grass clippings, leaves, prunings and weeds go in the lime-green garden or FOGO bin. Do not put them in the recycling or general waste bin.',
    sources: [
      { name: ACT, url: 'https://www.cityservices.act.gov.au/recyclopaedia/items/g/garden-waste' },
      {
        name: NSW_FOGO,
        url: 'https://www.epa.nsw.gov.au/Your-environment/Recycling-and-reuse/household-recycling-overview/what-can-go-in-your-fogo-bin',
      },
    ],
  },
  {
    slug: 'polystyrene',
    name: 'Polystyrene',
    bin: 'general',
    answer:
      'Polystyrene does not go in the recycling bin. Break it up and put it in the general waste bin, unless there is a drop-off near you.',
    dropOff:
      'Some councils and drop-off centres take clean, rigid polystyrene packaging. When you buy something new, you can also ask the retailer to take the packaging away.',
    sources: [
      { name: ACT, url: 'https://www.cityservices.act.gov.au/recyclopaedia/items/p/polystyrene' },
      { name: SA, url: 'https://www.whichbin.sa.gov.au/a-z-items' },
    ],
  },
  {
    slug: 'light-globes',
    name: 'Light globes',
    bin: 'none',
    answer:
      'Light globes never go in the recycling bin. Fluorescent tubes and globes contain mercury, so take them to a drop-off point.',
    varies:
      'The ACT says old incandescent and halogen globes can be wrapped in paper and put in the general waste bin in small amounts.',
    dropOff:
      'Take globes and tubes to your council’s drop-off or a participating retailer, such as IKEA or Mitre 10.',
    sources: [
      {
        name: ACT,
        url: 'https://www.cityservices.act.gov.au/recyclopaedia/items/l/light-bulbsglobes',
      },
      { name: SA, url: 'https://www.whichbin.sa.gov.au/a-z-items' },
    ],
  },
  {
    slug: 'mobile-phones',
    name: 'Mobile phones',
    bin: 'none',
    answer:
      'Mobile phones do not go in any bin. Their batteries can start fires in trucks and recycling plants.',
    prepare: ['Back up and wipe your personal data first'],
    dropOff:
      'MobileMuster recycles any phone, battery, charger and accessory for free. Drop it at a collection point (including many Telstra, Optus, Vodafone and Officeworks stores) or post it free.',
    sources: [
      { name: RNY, url: 'https://recyclingnearyou.com.au/material/home/mobile-phones' },
      {
        name: ACT,
        url: 'https://www.cityservices.act.gov.au/recyclopaedia/items/m/mobile-phones-and-accessories',
      },
    ],
  },
  {
    slug: 'e-waste',
    name: 'E-waste (TVs, computers and electronics)',
    bin: 'none',
    answer:
      'TVs, computers and other electronics do not go in any household bin. Take them to an e-waste drop-off, where TVs and computers are recycled for free.',
    prepare: ['Take out batteries and printer cartridges', 'Wipe your personal data'],
    varies:
      'In Victoria it has been illegal since 2019 to put anything with a plug, battery or power cord in household rubbish. South Australia also bans e-waste from landfill.',
    dropOff:
      'The National Television and Computer Recycling Scheme takes TVs, computers and accessories for free at collection points across Australia.',
    sources: [
      { name: RNY, url: 'https://recyclingnearyou.com.au/material/home/computers' },
      { name: 'Victorian Government: E-waste ban', url: 'https://www.vic.gov.au/e-waste-ban' },
    ],
  },
  {
    slug: 'paint',
    name: 'Paint',
    bin: 'none',
    answer:
      'Paint does not go in any household bin, because its chemicals can pollute groundwater. Take leftover paint and its tins to a free Paintback drop-off.',
    varies: 'Brushes, rollers and trays go in the general waste bin.',
    dropOff:
      'Paintback has more than 165 free drop-off sites. The ACT accepts up to 100 litres per visit, in containers of 20 litres or less.',
    sources: [
      { name: RNY, url: 'https://recyclingnearyou.com.au/material/home/paint' },
      { name: ACT, url: 'https://www.cityservices.act.gov.au/recyclopaedia/items/p/paint' },
    ],
  },
  {
    slug: 'gas-bottles',
    name: 'Gas bottles',
    bin: 'none',
    answer:
      'Gas bottles and cylinders never go in any household bin, even when empty. This includes helium balloon tanks and small cream chargers.',
    dropOff:
      'Swap empty barbecue bottles (up to 9 kg) for full ones at most service stations and hardware stores, or take them to a household hazardous waste drop-off. Return larger cylinders to your gas supplier.',
    sources: [
      {
        name: ACT,
        url: 'https://www.cityservices.act.gov.au/recyclopaedia/items/g/gas-bottles-and-cylinders',
      },
      { name: SA, url: 'https://www.whichbin.sa.gov.au/a-z-items' },
    ],
  },
  {
    slug: 'clothes-and-textiles',
    name: 'Clothes and textiles',
    bin: 'none',
    answer:
      'Clothes and textiles never go in the recycling bin; recycling plants cannot process them. Donate wearable items, and put clothes that cannot be reused or recycled in the general waste bin.',
    dropOff:
      'Give good clothes to a charity shop (call first). Some retailers, such as H&M, take worn-out clothes of any brand, and Sheridan stores take old sheets and towels.',
    sources: [
      { name: RNY, url: 'https://recyclingnearyou.com.au/material/home/clothing' },
      { name: ACT, url: 'https://www.cityservices.act.gov.au/recyclopaedia/items/t/textiles' },
    ],
  },
  {
    slug: 'shredded-paper',
    name: 'Shredded paper',
    bin: 'general',
    answer:
      'Shredded paper is too small to be sorted at most recycling plants, so it does not go loose in the recycling bin. Compost it, or put it in the general waste bin.',
    varies:
      'This differs a lot by council. South Australia asks for it in the green organics bin, inside a paper bag. Check your council\u2019s rule.',
    sources: [
      {
        name: ACT,
        url: 'https://www.cityservices.act.gov.au/recyclopaedia/items/s/shredded-paper2',
      },
      { name: SA, url: 'https://www.whichbin.sa.gov.au/a-z-items' },
    ],
  },
  {
    slug: 'egg-cartons',
    name: 'Egg cartons',
    bin: 'recycling',
    answer: 'Cardboard egg cartons go in the recycling bin with other cardboard.',
    sources: [
      { name: ACT, url: 'https://www.cityservices.act.gov.au/recyclopaedia/items/c/cardboard' },
      { name: SA, url: 'https://www.whichbin.sa.gov.au/a-z-items' },
    ],
  },
  {
    slug: 'milk-and-juice-cartons',
    name: 'Milk and juice cartons',
    bin: 'recycling',
    answer:
      'Fresh milk and juice cartons go in the recycling bin in most council areas. Long-life (foil-lined) cartons are not accepted everywhere.',
    prepare: [
      'Empty them',
      'Remove plastic lids, spouts and straws (these go in general waste)',
      'Flatten and put them in loose',
    ],
    varies:
      'Some councils do not take long-life cartons; cut the top to check for a silver lining. Some small drink cartons, like juice poppers, earn a 10c refund through container deposit schemes, but which cartons count depends on your state.',
    sources: [
      { name: RNY, url: 'https://recyclingnearyou.com.au/material/home/cartons' },
      {
        name: ACT,
        url: 'https://www.cityservices.act.gov.au/recyclopaedia/items/d/drink-cartons-milk-cartons,-tetra-packs,-juice-poppers',
      },
    ],
  },
  {
    slug: 'plastic-bottles',
    name: 'Plastic bottles',
    bin: 'recycling',
    answer:
      'Plastic drink and milk bottles go in the recycling bin. Drink bottles can also earn a 10c refund through your state’s container deposit scheme.',
    prepare: ['Empty them', 'Follow your council’s rule on lids'],
    varies: 'Councils differ on whether lids stay on or come off; see bottle lids.',
    sources: [
      { name: ACT, url: 'https://www.cityservices.act.gov.au/recyclopaedia/items/m/milk-bottles' },
      { name: SA, url: 'https://www.whichbin.sa.gov.au/a-z-items' },
    ],
  },
  {
    slug: 'bottle-lids',
    name: 'Bottle lids',
    bin: 'general',
    answer:
      'Lids smaller than a credit card are too small to be sorted, so on their own they go in the general waste bin. Large lids can go loose in the recycling bin.',
    varies:
      'This is one of the biggest differences between councils. Some, like Inner West Council (NSW), ask you to leave lids on plastic bottles and screw metal lids back on jars. Others, like the ACT and Surf Coast (Vic), ask you to take them off. Check your council’s rule.',
    sources: [
      { name: ACT, url: 'https://www.cityservices.act.gov.au/recyclopaedia/items/l/lids' },
      {
        name: 'Inner West Council: Recycling',
        url: 'https://www.innerwest.nsw.gov.au/household-bins/recycling',
      },
    ],
  },
  {
    slug: 'takeaway-containers',
    name: 'Plastic takeaway containers',
    bin: 'recycling',
    answer:
      'Rigid plastic takeaway containers go in the recycling bin once empty and dry. Foam (polystyrene) containers do not.',
    prepare: ['Scrape out the food', 'Make sure they are empty and dry'],
    varies:
      'The ACT accepts only plastic codes 1, 2, 3 and 5; codes 4, 6 and 7 go in general waste. Check the number on the base.',
    sources: [
      {
        name: ACT,
        url: 'https://www.cityservices.act.gov.au/recyclopaedia/items/p/plastic-food-containers',
      },
      { name: SA, url: 'https://www.whichbin.sa.gov.au/a-z-items' },
    ],
  },
  {
    slug: 'aluminium-foil',
    name: 'Aluminium foil',
    bin: 'recycling',
    answer:
      'Clean aluminium foil and foil trays go in the recycling bin. Scrunch foil into a ball at least the size of your fist so the machines can catch it.',
    prepare: ['Wipe off food', 'Collect foil and scrunch it into a fist-sized ball or bigger'],
    varies:
      'Dirty foil goes in general waste. Some councils ask for a tennis-ball-sized ball. Chip packets are not foil and go in general waste.',
    sources: [
      { name: SA, url: 'https://www.whichbin.sa.gov.au/a-z-items' },
      {
        name: 'Inner West Council: Recycling',
        url: 'https://www.innerwest.nsw.gov.au/household-bins/recycling',
      },
    ],
  },
  {
    slug: 'tissues-and-paper-towel',
    name: 'Tissues and paper towel',
    bin: 'general',
    answer:
      'Used tissues, paper towel and napkins never go in the recycling bin. Put them in the general waste bin, or a home compost.',
    varies:
      'In South Australia most councils accept them in the green organics bin. NSW FOGO rules do not allow paper towel or serviettes in the FOGO bin.',
    sources: [
      { name: ACT, url: 'https://www.cityservices.act.gov.au/recyclopaedia/items/p/paper-towel' },
      { name: SA, url: 'https://www.whichbin.sa.gov.au/a-z-items' },
      {
        name: NSW_FOGO,
        url: 'https://www.epa.nsw.gov.au/Your-environment/Recycling-and-reuse/household-recycling-overview/what-can-go-in-your-fogo-bin',
      },
    ],
  },
  {
    slug: 'broken-glass-and-ceramics',
    name: 'Broken glass, ceramics and drinking glasses',
    bin: 'general',
    answer:
      'Drinking glasses, broken glass, crockery, Pyrex and ceramics go in the general waste bin, not the recycling or glass bin. They are made differently from bottle and jar glass and cannot be recycled with it.',
    prepare: ['Wrap broken pieces in newspaper so collectors do not get cut'],
    dropOff: 'Donate items in good condition to an op shop.',
    sources: [
      { name: ACT, url: 'https://www.cityservices.act.gov.au/recyclopaedia/items/c/ceramics' },
      {
        name: 'Surf Coast Shire: Glass-only bin',
        url: 'https://www.surfcoast.vic.gov.au/Property/Waste-and-recycling/Kerbside-bins/GLASS-only-bin',
      },
    ],
  },
  {
    slug: 'coffee-pods',
    name: 'Coffee pods',
    bin: 'general',
    answer:
      'Coffee pods and capsules never go in the recycling bin; they are too small and made of mixed materials. Use a brand recycling program, or put them in the general waste bin.',
    dropOff:
      'Nespresso recycles aluminium capsules of any brand at its stores and collection points. TerraCycle runs free programs for some brands, such as L’OR, Moccona and NESCAFÉ Dolce Gusto.',
    sources: [
      { name: RNY, url: 'https://recyclingnearyou.com.au/material/home/coffee-capsules' },
      {
        name: ACT,
        url: 'https://www.cityservices.act.gov.au/recyclopaedia/items/c/coffee-podscapsules',
      },
    ],
  },
  {
    slug: 'medicines',
    name: 'Medicines',
    bin: 'none',
    answer:
      'Take unwanted and out-of-date medicines to any community pharmacy for free, safe disposal. Never flush them or pour them down the sink.',
    dropOff:
      'Pharmacies collect them through the Return Unwanted Medicines (RUM) Project, funded by the Australian Government.',
    sources: [
      { name: ACT, url: 'https://www.cityservices.act.gov.au/recyclopaedia/items/m/medicines' },
      { name: SA, url: 'https://www.whichbin.sa.gov.au/a-z-items' },
    ],
  },
  {
    slug: 'needles-and-sharps',
    name: 'Needles and sharps',
    bin: 'none',
    answer:
      'Used needles, syringes and lancets never go loose in any household bin or the recycling. Keep them in a puncture-proof container and take it to a sharps disposal point when full.',
    prepare: [
      'Use an approved sharps container from a pharmacy, or a strong screw-top plastic bottle',
    ],
    varies:
      'Rules differ between councils, so ask yours. The ACT does not allow sharps in any household bin, even inside a sealed container.',
    dropOff:
      'Public sharps bins are at hospitals, some pharmacies and medical centres, community health centres, and council toilets and parks.',
    sources: [
      {
        name: 'NSW Health: Community sharps',
        url: 'https://www.health.nsw.gov.au/community-sharps',
      },
      { name: ACT, url: 'https://www.cityservices.act.gov.au/recyclopaedia/items/s/syringes' },
    ],
  },
  {
    slug: 'dog-poo',
    name: 'Dog poo',
    bin: 'general',
    answer: 'Dog poo goes in the general waste bin. It does not go in the recycling bin.',
    varies:
      'NSW FOGO rules ban pet poo, pet litter and poo bags from the FOGO bin because of germs. In South Australia, many councils accept dog poo in the green organics bin if it is loose, wrapped in newspaper or in a compostable bag.',
    sources: [
      {
        name: NSW_FOGO,
        url: 'https://www.epa.nsw.gov.au/Your-environment/Recycling-and-reuse/household-recycling-overview/what-can-go-in-your-fogo-bin',
      },
      { name: SA, url: 'https://www.whichbin.sa.gov.au/a-z-items' },
    ],
  },
  {
    slug: 'cooking-oil',
    name: 'Cooking oil',
    bin: 'general',
    answer:
      'Let small amounts of cooking oil cool, pour it into a container with a tight lid, and put it in the general waste bin. Never pour oil down the drain or into the recycling bin.',
    varies: 'South Australia allows very small amounts in the green organics bin.',
    dropOff:
      'Larger household amounts can go to a council drop-off; the ACT takes up to 20 litres free.',
    sources: [
      { name: ACT, url: 'https://www.cityservices.act.gov.au/recyclopaedia/items/c/cooking-oil' },
      { name: SA, url: 'https://www.whichbin.sa.gov.au/a-z-items' },
    ],
  },
  {
    slug: 'bread-bags',
    name: 'Bread bags',
    bin: 'none',
    answer:
      'Bread bags are soft plastic, so they do not go in the recycling bin. Take them to a supermarket soft plastics drop-off, or put them in general waste.',
    prepare: ['Shake out the crumbs', 'Remove the plastic bread tag (it goes in general waste)'],
    dropOff:
      'More than 700 Woolworths supermarkets collect bread bags with other clean soft plastics.',
    sources: [
      {
        name: 'Woolworths Group (12 November 2026)',
        url: 'https://woolworthsgroup.com.au/au/en/our-newsroom/media-releases/latest-news/2026/national-recycling-week.html',
      },
      { name: ACT, url: 'https://www.cityservices.act.gov.au/recyclopaedia/items/s/soft-plastics' },
    ],
  },
  {
    slug: 'receipts',
    name: 'Receipts',
    bin: 'general',
    answer:
      'Most receipts are printed on thermal paper with chemicals that spoil paper recycling, so they go in the general waste bin. Ask for a digital receipt instead.',
    sources: [
      { name: ACT, url: 'https://www.cityservices.act.gov.au/recyclopaedia/items/p/paper' },
      {
        name: 'Glen Eira City Council',
        url: 'https://www.gleneira.vic.gov.au/services/rubbish-and-recycling/rubbish-or-recyclable-our-a-z-guide/receipts-thermal-paper',
      },
    ],
  },
  {
    slug: 'compostable-plastics',
    name: 'Compostable and biodegradable plastics',
    bin: 'general',
    answer:
      'Compostable and biodegradable plastic bags, cups and packaging go in the general waste bin in most areas. They do not go in the recycling bin.',
    varies:
      'This differs by state. NSW allows only certified compostable kitchen caddy liners (AS 4736) in the FOGO bin, and no other compostable or biodegradable plastic. The ACT does not accept bioplastics in its FOGO bin. South Australia accepts items with the AS 4736 seedling logo in the green organics bin.',
    sources: [
      { name: ACT, url: 'https://www.cityservices.act.gov.au/recyclopaedia/items/b/bioplastic' },
      {
        name: NSW_FOGO,
        url: 'https://www.epa.nsw.gov.au/Your-environment/Recycling-and-reuse/household-recycling-overview/what-can-go-in-your-fogo-bin',
      },
      { name: SA, url: 'https://www.whichbin.sa.gov.au/a-z-items' },
    ],
  },
  {
    slug: 'plastic-toys',
    name: 'Plastic toys and hard plastics',
    bin: 'general',
    answer:
      'Plastic toys do not go in the recycling bin. Donate toys in good condition, and put broken ones in the general waste bin.',
    prepare: ['Take out any batteries first; toys with built-in batteries or cords are e-waste'],
    varies:
      'Hard plastic packaging such as tubs and containers is recyclable, but other hard plastic items are not accepted by most councils.',
    sources: [
      { name: ACT, url: 'https://www.cityservices.act.gov.au/recyclopaedia/items/t/toys' },
      { name: SA, url: 'https://www.whichbin.sa.gov.au/a-z-items' },
    ],
  },
  {
    slug: 'mirrors-and-window-glass',
    name: 'Mirrors and window glass',
    bin: 'general',
    answer:
      'Mirrors and window glass cannot be recycled with bottles and jars. Small pieces go in the general waste bin, well wrapped; large panes go to your council’s drop-off.',
    prepare: ['Wrap broken glass in newspaper or cardboard'],
    dropOff:
      'Donate mirrors in good condition, or take large panes to your council tip or resource recovery centre (fees may apply).',
    sources: [
      {
        name: ACT,
        url: 'https://www.cityservices.act.gov.au/recyclopaedia/items/g/glass-bottles-and-jars',
      },
      { name: SA, url: 'https://www.whichbin.sa.gov.au/a-z-items' },
    ],
  },
  {
    slug: 'wet-wipes',
    name: 'Wet wipes',
    bin: 'general',
    answer:
      'Used wet wipes go in the general waste bin. Never flush them, even ones labelled flushable.',
    sources: [
      { name: ACT, url: 'https://www.cityservices.act.gov.au/recyclopaedia/items/w/wipes' },
    ],
  },
  {
    slug: 'container-deposit-scheme',
    name: 'Drink containers with a refund',
    bin: 'recycling',
    answer:
      'Most drink cans, bottles and small cartons between 150 mL and 3 litres earn a 10c refund when you return them to a refund point. If you do not return them, they go in your recycling bin.',
    varies:
      'Every state and territory now has a scheme; the newest is Recycle Rewards in Tasmania, which started on 1 May 2025. Which containers count differs: WA added wine and spirit bottles from 1 July 2026, while the ACT still excludes plain milk, pure juice, cordial, wine and spirits.',
    dropOff:
      'Return containers empty to a refund point, depot or reverse vending machine. You can usually donate the refund to a charity.',
    sources: [
      { name: RNY, url: 'https://recyclingnearyou.com.au/material/home/cartons' },
      {
        name: 'ACT Container Deposit Scheme',
        url: 'https://www.cityservices.act.gov.au/recycling-and-waste/drop-off/container-deposit-scheme',
      },
      {
        name: 'WA Government: Container deposit scheme',
        url: 'https://www.wa.gov.au/service/building-utilities-and-essential-services/waste-management/container-deposit-scheme',
      },
      {
        name: 'Clarence City Council: Recycle Rewards launch',
        url: 'https://www.ccc.tas.gov.au/notice/recycle-rewards-launches-1-may-2025-cash-in-your-containers/',
      },
    ],
  },
] as const;
