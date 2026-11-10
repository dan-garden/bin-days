import { canberra } from './act/canberra.js';
import { armidale } from './nsw/armidale.js';
import { ballina } from './nsw/ballina.js';
import { bathurst } from './nsw/bathurst.js';
import { bayside } from './nsw/bayside.js';
import { begaValley } from './nsw/bega-valley.js';
import { bellingen } from './nsw/bellingen.js';
import { blacktown } from './nsw/blacktown.js';
import { blueMountains } from './nsw/blue-mountains.js';
import { burwood } from './nsw/burwood.js';
import { campbelltown } from './nsw/campbelltown.js';
import { canadaBay } from './nsw/canada-bay.js';
import { cessnock } from './nsw/cessnock.js';
import { clarenceValley } from './nsw/clarence-valley.js';
import { coffsHarbour } from './nsw/coffs-harbour.js';
import { cowra } from './nsw/cowra.js';
import { cumberland } from './nsw/cumberland.js';
import { forbes } from './nsw/forbes.js';
import { gwydir } from './nsw/gwydir.js';
import { huntersHill } from './nsw/hunters-hill.js';
import { innerWest } from './nsw/inner-west.js';
import { kempsey } from './nsw/kempsey.js';
import { kiama } from './nsw/kiama.js';
import { kuRingGai } from './nsw/ku-ring-gai.js';
import { lakeMacquarie } from './nsw/lake-macquarie.js';
import { leeton } from './nsw/leeton.js';
import { lismore } from './nsw/lismore.js';
import { lithgow } from './nsw/lithgow.js';
import { liverpool } from './nsw/liverpool.js';
import { midCoast } from './nsw/mid-coast.js';
import { moreePlains } from './nsw/moree-plains.js';
import { penrith } from './nsw/penrith.js';
import { portMacquarieHastings } from './nsw/port-macquarie-hastings.js';
import { portStephens } from './nsw/port-stephens.js';
import { queanbeyanPalerang } from './nsw/queanbeyan-palerang.js';
import { ryde } from './nsw/ryde.js';
import { shoalhaven } from './nsw/shoalhaven.js';
import { snowyValleys } from './nsw/snowy-valleys.js';
import { strathfield } from './nsw/strathfield.js';
import { sydney } from './nsw/sydney.js';
import { theHills } from './nsw/the-hills.js';
import { tweed } from './nsw/tweed.js';
import { upperHunter } from './nsw/upper-hunter.js';
import { willoughby } from './nsw/willoughby.js';
import { wollongong } from './nsw/wollongong.js';
import { woollahra } from './nsw/woollahra.js';
import { brisbane } from './qld/brisbane.js';
import { bundaberg } from './qld/bundaberg.js';
import { cassowaryCoast } from './qld/cassowary-coast.js';
import { fraserCoast } from './qld/fraser-coast.js';
import { gladstone } from './qld/gladstone.js';
import { goldCoast } from './qld/gold-coast.js';
import { gympie } from './qld/gympie.js';
import { livingstone } from './qld/livingstone.js';
import { logan } from './qld/logan.js';
import { mackay } from './qld/mackay.js';
import { moretonBay } from './qld/moreton-bay.js';
import { redland } from './qld/redland.js';
import { southBurnett } from './qld/south-burnett.js';
import { CouncilRegistry } from './registry.js';
import { adelaide } from './sa/adelaide.js';
import { adelaideHills } from './sa/adelaide-hills.js';
import { adelaidePlains } from './sa/adelaide-plains.js';
import { alexandrina } from './sa/alexandrina.js';
import { berriBarmera } from './sa/berri-barmera.js';
import { burnside } from './sa/burnside.js';
import { charlesSturt } from './sa/charles-sturt.js';
import { clareAndGilbertValleys } from './sa/clare-and-gilbert-valleys.js';
import { cleve } from './sa/cleve.js';
import { coorong } from './sa/coorong.js';
import { copperCoast } from './sa/copper-coast.js';
import { flindersRanges } from './sa/flinders-ranges.js';
import { gawler } from './sa/gawler.js';
import { goyder } from './sa/goyder.js';
import { kangarooIsland } from './sa/kangaroo-island.js';
import { kingstonSa } from './sa/kingston.js';
import { light } from './sa/light.js';
import { lowerEyrePeninsula } from './sa/lower-eyre-peninsula.js';
import { marion } from './sa/marion.js';
import { midMurray } from './sa/mid-murray.js';
import { mitcham } from './sa/mitcham.js';
import { mountBarker } from './sa/mount-barker.js';
import { mountGambier } from './sa/mount-gambier.js';
import { murrayBridge } from './sa/murray-bridge.js';
import { naracoorteLucindale } from './sa/naracoorte-lucindale.js';
import { northernAreas } from './sa/northern-areas.js';
import { norwoodPaynehamAndStPeters } from './sa/norwood-payneham-and-st-peters.js';
import { onkaparinga } from './sa/onkaparinga.js';
import { playford } from './sa/playford.js';
import { portAdelaideEnfield } from './sa/port-adelaide-enfield.js';
import { portAugusta } from './sa/port-augusta.js';
import { portLincoln } from './sa/port-lincoln.js';
import { portPirie } from './sa/port-pirie.js';
import { prospect } from './sa/prospect.js';
import { renmarkParinga } from './sa/renmark-paringa.js';
import { robe } from './sa/robe.js';
import { salisbury } from './sa/salisbury.js';
import { streakyBay } from './sa/streaky-bay.js';
import { teaTreeGully } from './sa/tea-tree-gully.js';
import { tumbyBay } from './sa/tumby-bay.js';
import { unley } from './sa/unley.js';
import { wakefield } from './sa/wakefield.js';
import { walkerville } from './sa/walkerville.js';
import { westTorrens } from './sa/west-torrens.js';
import { whyalla } from './sa/whyalla.js';
import { yankalilla } from './sa/yankalilla.js';
import { yorkePeninsula } from './sa/yorke-peninsula.js';
import { hobart } from './tas/hobart.js';
import { launceston } from './tas/launceston.js';
import type { CouncilAdapter } from './types.js';
import { ballarat } from './vic/ballarat.js';
import { banyule } from './vic/banyule.js';
import { bawBaw } from './vic/baw-baw.js';
import { baysideVic } from './vic/bayside.js';
import { benalla } from './vic/benalla.js';
import { cardinia } from './vic/cardinia.js';
import { casey } from './vic/casey.js';
import { colacOtway } from './vic/colac-otway.js';
import { darebin } from './vic/darebin.js';
import { glenelg } from './vic/glenelg.js';
import { hobsonsBay } from './vic/hobsons-bay.js';
import { horsham } from './vic/horsham.js';
import { hume } from './vic/hume.js';
import { kingstonVic } from './vic/kingston.js';
import { loddon } from './vic/loddon.js';
import { macedonRanges } from './vic/macedon-ranges.js';
import { maribyrnong } from './vic/maribyrnong.js';
import { maroondah } from './vic/maroondah.js';
import { melton } from './vic/melton.js';
import { mildura } from './vic/mildura.js';
import { moira } from './vic/moira.js';
import { monash } from './vic/monash.js';
import { moorabool } from './vic/moorabool.js';
import { morningtonPeninsula } from './vic/mornington-peninsula.js';
import { mountAlexander } from './vic/mount-alexander.js';
import { moyne } from './vic/moyne.js';
import { murrindindi } from './vic/murrindindi.js';
import { nillumbik } from './vic/nillumbik.js';
import { portPhillip } from './vic/port-phillip.js';
import { pyrenees } from './vic/pyrenees.js';
import { stonnington } from './vic/stonnington.js';
import { surfCoast } from './vic/surf-coast.js';
import { swanHill } from './vic/swan-hill.js';
import { wangaratta } from './vic/wangaratta.js';
import { wellington } from './vic/wellington.js';
import { whittlesea } from './vic/whittlesea.js';
import { yarraRanges } from './vic/yarra-ranges.js';
import { bayswater } from './wa/bayswater.js';
import { gosnells } from './wa/gosnells.js';
import { joondalup } from './wa/joondalup.js';
import { kwinana } from './wa/kwinana.js';
import { mandurah } from './wa/mandurah.js';
import { rockingham } from './wa/rockingham.js';
import { serpentineJarrahdale } from './wa/serpentine-jarrahdale.js';
import { southPerth } from './wa/south-perth.js';
import { swan } from './wa/swan.js';

/**
 * Every supported council. To add one, create `src/councils/<state>/<name>.ts`
 * (usually a few lines using a platform adapter) and add it here.
 */
export const ALL_COUNCILS: readonly CouncilAdapter[] = [
  canberra,
  armidale,
  ballina,
  bathurst,
  bayside,
  begaValley,
  bellingen,
  blacktown,
  blueMountains,
  burwood,
  campbelltown,
  canadaBay,
  cessnock,
  clarenceValley,
  coffsHarbour,
  cowra,
  cumberland,
  forbes,
  gwydir,
  huntersHill,
  innerWest,
  kempsey,
  kiama,
  kuRingGai,
  lakeMacquarie,
  leeton,
  lismore,
  lithgow,
  liverpool,
  midCoast,
  moreePlains,
  penrith,
  portMacquarieHastings,
  portStephens,
  queanbeyanPalerang,
  ryde,
  shoalhaven,
  snowyValleys,
  strathfield,
  sydney,
  theHills,
  tweed,
  upperHunter,
  willoughby,
  wollongong,
  woollahra,
  brisbane,
  bundaberg,
  cassowaryCoast,
  fraserCoast,
  gladstone,
  goldCoast,
  gympie,
  livingstone,
  logan,
  mackay,
  moretonBay,
  redland,
  southBurnett,
  adelaide,
  adelaideHills,
  adelaidePlains,
  alexandrina,
  berriBarmera,
  burnside,
  charlesSturt,
  clareAndGilbertValleys,
  cleve,
  coorong,
  copperCoast,
  flindersRanges,
  gawler,
  goyder,
  kangarooIsland,
  kingstonSa,
  light,
  lowerEyrePeninsula,
  marion,
  midMurray,
  mitcham,
  mountBarker,
  mountGambier,
  murrayBridge,
  naracoorteLucindale,
  northernAreas,
  norwoodPaynehamAndStPeters,
  onkaparinga,
  playford,
  portAdelaideEnfield,
  portAugusta,
  portLincoln,
  portPirie,
  prospect,
  renmarkParinga,
  robe,
  salisbury,
  streakyBay,
  teaTreeGully,
  tumbyBay,
  unley,
  wakefield,
  walkerville,
  westTorrens,
  whyalla,
  yankalilla,
  yorkePeninsula,
  hobart,
  launceston,
  ballarat,
  banyule,
  bawBaw,
  baysideVic,
  benalla,
  cardinia,
  casey,
  colacOtway,
  darebin,
  glenelg,
  hobsonsBay,
  horsham,
  hume,
  kingstonVic,
  loddon,
  macedonRanges,
  maribyrnong,
  maroondah,
  melton,
  mildura,
  moira,
  monash,
  moorabool,
  morningtonPeninsula,
  mountAlexander,
  moyne,
  murrindindi,
  nillumbik,
  portPhillip,
  pyrenees,
  stonnington,
  surfCoast,
  swanHill,
  wangaratta,
  wellington,
  whittlesea,
  yarraRanges,
  bayswater,
  gosnells,
  joondalup,
  kwinana,
  mandurah,
  rockingham,
  serpentineJarrahdale,
  southPerth,
  swan,
];

export function createDefaultRegistry(): CouncilRegistry {
  return new CouncilRegistry(ALL_COUNCILS);
}

export { CouncilRegistry } from './registry.js';
export type { AdapterContext, CouncilAdapter, CouncilInfo } from './types.js';
