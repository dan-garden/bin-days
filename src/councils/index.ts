import { bayside } from './nsw/bayside.js';
import { begaValley } from './nsw/bega-valley.js';
import { bellingen } from './nsw/bellingen.js';
import { blueMountains } from './nsw/blue-mountains.js';
import { burwood } from './nsw/burwood.js';
import { campbelltown } from './nsw/campbelltown.js';
import { canadaBay } from './nsw/canada-bay.js';
import { clarenceValley } from './nsw/clarence-valley.js';
import { coffsHarbour } from './nsw/coffs-harbour.js';
import { cowra } from './nsw/cowra.js';
import { cumberland } from './nsw/cumberland.js';
import { forbes } from './nsw/forbes.js';
import { gwydir } from './nsw/gwydir.js';
import { innerWest } from './nsw/inner-west.js';
import { kuRingGai } from './nsw/ku-ring-gai.js';
import { lithgow } from './nsw/lithgow.js';
import { liverpool } from './nsw/liverpool.js';
import { moreePlains } from './nsw/moree-plains.js';
import { penrith } from './nsw/penrith.js';
import { portMacquarieHastings } from './nsw/port-macquarie-hastings.js';
import { portStephens } from './nsw/port-stephens.js';
import { queanbeyanPalerang } from './nsw/queanbeyan-palerang.js';
import { snowyValleys } from './nsw/snowy-valleys.js';
import { wollongong } from './nsw/wollongong.js';
import { brisbane } from './qld/brisbane.js';
import { goldCoast } from './qld/gold-coast.js';
import { gympie } from './qld/gympie.js';
import { livingstone } from './qld/livingstone.js';
import { redland } from './qld/redland.js';
import { southBurnett } from './qld/south-burnett.js';
import { CouncilRegistry } from './registry.js';
import type { CouncilAdapter } from './types.js';
import { ballarat } from './vic/ballarat.js';
import { bawBaw } from './vic/baw-baw.js';
import { benalla } from './vic/benalla.js';
import { horsham } from './vic/horsham.js';
import { moira } from './vic/moira.js';
import { murrindindi } from './vic/murrindindi.js';
import { wellington } from './vic/wellington.js';

/**
 * Every supported council. To add one, create `src/councils/<state>/<name>.ts`
 * (usually a few lines using a platform adapter) and add it here.
 */
export const ALL_COUNCILS: readonly CouncilAdapter[] = [
  bayside,
  begaValley,
  bellingen,
  blueMountains,
  burwood,
  campbelltown,
  canadaBay,
  clarenceValley,
  coffsHarbour,
  cowra,
  cumberland,
  forbes,
  gwydir,
  innerWest,
  kuRingGai,
  lithgow,
  liverpool,
  moreePlains,
  penrith,
  portMacquarieHastings,
  portStephens,
  queanbeyanPalerang,
  snowyValleys,
  wollongong,
  brisbane,
  goldCoast,
  gympie,
  livingstone,
  redland,
  southBurnett,
  ballarat,
  bawBaw,
  benalla,
  horsham,
  moira,
  murrindindi,
  wellington,
];

export function createDefaultRegistry(): CouncilRegistry {
  return new CouncilRegistry(ALL_COUNCILS);
}

export { CouncilRegistry } from './registry.js';
export type { AdapterContext, CouncilAdapter, CouncilInfo } from './types.js';
