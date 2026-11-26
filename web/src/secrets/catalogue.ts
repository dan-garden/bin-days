/** The hidden extras, and the logic behind when they turn up. No DOM, so they're unit tested. */

/**
 * Every secret there is to find: its name, and a bin fact for kids that shows when it's found.
 * Facts are general; anything that differs between councils says so.
 */
export const SECRETS = {
  easter: {
    name: 'The Easter bunny',
    fact: 'Scrunch chocolate foil into a ball the size of a fist, and many councils take it in recycling.',
  },
  christmas: {
    name: 'Santa on his rounds',
    fact: 'Scrunch wrapping paper: if it springs back open, it has plastic in it and goes in general waste.',
  },
  halloween: {
    name: 'A Halloween bat',
    fact: 'Pumpkin leftovers can go in the green bin, if your council takes food scraps, or the compost.',
  },
  newyear: {
    name: 'New Year party',
    fact: 'A good habit for the new year: keep plastic bags out of the recycling bin.',
  },
  bounce: {
    name: 'Bin bouncer',
    fact: 'Lid colours: red for general waste, yellow for recycling, green for garden (and food), and in some places purple for glass.',
  },
  party: {
    name: 'Recycling party',
    fact: 'Aluminium cans can be recycled again and again, forever.',
  },
  quake: {
    name: 'Bin quake',
    fact: 'Squash boxes flat, so much more fits in the recycling bin.',
  },
  ibis: {
    name: 'The bin chicken',
    fact: 'Australian white ibis raid bins for food scraps. Keep your lid shut!',
  },
  disco: {
    name: 'Disco lights',
    fact: 'Batteries and light globes never go in your bins. They can start fires in the truck, so take them to a drop-off point.',
  },
  peek: {
    name: 'A shy bin',
    fact: 'Put bins out the night before, lids shut, with a gap around each one so the truck’s arm can grab it.',
  },
  binday: { name: "It's bin day!", fact: 'Bins out, lids shut, and wave to the driver.' },
  truck: {
    name: 'Honk honk',
    fact: 'Most bin trucks lift each bin with a robot arm, worked from the driver’s seat.',
  },
  flies: {
    name: 'A smelly bin',
    fact: 'Flies love food scraps. Wrap them up and keep the lid shut so flies can’t get in.',
  },
  lights: {
    name: 'Lights out',
    fact: 'Switching off lights nobody is using saves energy.',
  },
  koala: {
    name: 'A koala in the tree',
    fact: 'Koalas sleep up to 20 hours a day. Litter in the bush can hurt wildlife, so always bin it.',
  },
} as const;

export type SecretId = keyof typeof SECRETS;
export type Season = 'easter' | 'christmas' | 'halloween' | 'newyear';
export const SEASONS: readonly Season[] = ['easter', 'christmas', 'halloween', 'newyear'];

/** Easter Sunday's [month, day] in the Gregorian calendar (the anonymous Gregorian algorithm). */
export function easterSunday(year: number): [number, number] {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - Math.floor(b / 4) - g + 15) % 30;
  const l = (32 + 2 * (b % 4) + 2 * Math.floor(c / 4) - h - (c % 4)) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const n = h + l - 7 * m + 114;
  return [Math.floor(n / 31), (n % 31) + 1];
}

/** The occasion a day falls in: Good Friday to Easter Monday, 20–26 December, Halloween or New Year's Day. */
export function season(date: Date): Season | undefined {
  const year = date.getFullYear();
  const [month, day] = easterSunday(year);
  const fromEaster = Math.round(
    (new Date(year, date.getMonth(), date.getDate()).getTime() -
      new Date(year, month - 1, day).getTime()) /
      86_400_000,
  );
  if (fromEaster >= -2 && fromEaster <= 1) return 'easter';
  const [m, d] = [date.getMonth() + 1, date.getDate()];
  if (m === 12 && d >= 20 && d <= 26) return 'christmas';
  if (m === 10 && d === 31) return 'halloween';
  if (m === 1 && d === 1) return 'newyear';
  return undefined;
}

const KONAMI = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];
export const KONAMI_LENGTH = KONAMI.length;

/** How far into the Konami code the keys so far get, after `key`. The whole code is KONAMI_LENGTH. */
export function konami(progress: number, key: string): number {
  const pressed = key.length === 1 ? key.toLowerCase() : key;
  if (pressed === KONAMI[progress]) return progress + 1;
  // A third Up still leaves the last two as the code's start.
  if (pressed === KONAMI[0]) return progress === 2 ? 2 : 1;
  return 0;
}
