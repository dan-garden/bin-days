import { BILBY, BIN, FLYING_FOX, IBIS, KOALA, STAR, SURFING_SANTA } from './art.js';
import {
  KONAMI_LENGTH,
  konami,
  SEASONS,
  SECRETS,
  type Season,
  type SecretId,
  season,
} from './catalogue.js';
import { across, honk, jump, type Point, reduced, sprite, toast } from './fx.js';
import { confetti, emit, firework, shower } from './particles.js';

/**
 * Secrets: hidden extras for kids (and everyone) to find, by tapping, typing, shaking or just
 * visiting on the right day, each with a bin fact. At Easter, they're an egg hunt. They load once
 * the page is idle and play over it without moving it. What's found is remembered on this device.
 */

const FOUND = 'bin-days:secrets';
// `?occasion=easter` (or christmas, halloween, newyear) shows an occasion on any day, to try it out.
const asked = new URLSearchParams(location.search).get('occasion');
const occasion = SEASONS.find((name) => name === asked) ?? season(new Date());
const hunt = occasion === 'easter';

function foundSoFar(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(FOUND) ?? '[]'));
  } catch {
    return new Set(); // storage can be blocked, e.g. in private windows
  }
}

/** Remembers a secret as found and tells its fact, with how many are found the first time. */
function find(id: SecretId, at: Point) {
  const found = foundSoFar();
  const first = !found.has(id);
  found.add(id);
  try {
    localStorage.setItem(FOUND, JSON.stringify([...found]));
  } catch {}
  const total = Object.keys(SECRETS).length;
  const kind = hunt ? 'eggs' : 'secrets';
  toast(
    `${SECRETS[id].name}${first ? ` · ${found.size} of ${total} ${kind} found` : ''}`,
    SECRETS[id].fact,
    hunt,
  );
  // An Easter egg hunt: every find turns up eggs.
  if (hunt) emit('egg', at.x, at.y, 6);
  if (first && found.size === total) confetti();
}

const middle = (): Point => ({ x: innerWidth / 2, y: innerHeight / 2 });

/** Some of every kind of rubbish particle at a point. */
const scatter = (at: Point, ...kinds: Parameters<typeof emit>[0][]) => {
  for (const kind of kinds) emit(kind, at.x, at.y, 8);
};

/** A few fireworks over the top of the screen. */
const fireworks = (count: number) => {
  for (let i = 0; i < count; i++)
    setTimeout(
      () =>
        firework(
          innerWidth * (0.15 + Math.random() * 0.7),
          innerHeight * (0.12 + Math.random() * 0.25),
        ),
      i * 450,
    );
};

const EFFECTS: Record<SecretId, (at: Point) => void> = {
  easter: (at) => emit('egg', at.x, at.y, 14),
  christmas: (at) => {
    scatter(at, 'spark', 'confetti');
    shower('spark', 40, 2);
  },
  halloween: (at) => scatter(at, 'leaf', 'spark'),
  newyear: () => fireworks(6),
  bounce: () => confetti(),
  party: (at) => {
    shower('can', 30);
    emit('can', at.x, at.y, 10);
  },
  quake: () => {
    if (!reduced())
      document.querySelector('.page')?.animate(
        [0, -12, 12, -9, 9, -4, 0].map((x) => ({ transform: `translateX(${x}px)` })),
        { duration: 600 },
      );
    shower('bin', 18, 1);
  },
  ibis: () => {
    across(IBIS, innerHeight - 110, { duration: 6500, bob: 6 });
    setTimeout(() => emit('chip', innerWidth / 2, innerHeight - 90, 12), 2600);
  },
  disco: () => {
    if (!reduced())
      document.body.animate([{ filter: 'hue-rotate(0)' }, { filter: 'hue-rotate(360deg)' }], {
        duration: 1400,
        iterations: 2,
      });
  },
  peek: (at) => emit('spark', at.x, at.y, 20),
  binday: (at) => {
    confetti();
    emit('bin', at.x, at.y, 6);
  },
  truck: (at) => {
    honk();
    emit('spark', at.x, at.y, 16, 180);
  },
  flies: (at) => emit('fly', at.x, at.y, 9, 120),
  lights: (at) => emit('spark', at.x, at.y, 14, 140),
  koala: (at) => {
    sprite(
      KOALA,
      [
        { transform: 'translate(-50%, 0) scale(0.3)' },
        { transform: 'translate(-50%, -90px) scale(1.2)', offset: 0.3 },
        { transform: 'translate(-50%, -90px) scale(1.2)', offset: 0.8 },
        { transform: 'translate(-50%, 0) scale(0.3)', opacity: 0 },
      ],
      { duration: 2200, easing: 'ease-out' },
      at,
    );
    emit('leaf', at.x, at.y, 10);
  },
};

/** Plays a secret (at the spot it was found, if it has one) and counts it as found. */
export function play(id: SecretId, at: Point = middle()) {
  EFFECTS[id](at);
  find(id, at);
}

/** What turns up on each occasion, the Australian way: something to catch as it goes by. */
const PARADES: Record<Season, () => void> = {
  easter: () =>
    across(BILBY, innerHeight - 110, {
      duration: 7000,
      bob: 36,
      onTap: (at) => play('easter', at),
    }),
  // Christmas is summer here: sunshine sparkles, and Santa out on the surf.
  christmas: () => {
    shower('spark', 30, 6);
    across(SURFING_SANTA, innerHeight - 130, {
      duration: 9000,
      bob: 10,
      onTap: (at) => play('christmas', at),
    });
  },
  halloween: () => {
    for (let i = 0; i < 3; i++)
      across(FLYING_FOX, 60 + i * 90, { duration: 5500 + i * 900, bob: 24 });
    across(FLYING_FOX, innerHeight / 2, {
      duration: 6500,
      bob: 30,
      onTap: (at) => play('halloween', at),
    });
  },
  newyear: () => {
    fireworks(4);
    across(STAR, innerHeight / 3, { duration: 7000, bob: 24, onTap: (at) => play('newyear', at) });
  },
};

/** Every so often, a few times a visit, while the page is in view. */
function nowAndAgain(task: () => void, every: number, times: number) {
  let left = times;
  const tick = () => {
    if (!document.hidden) {
      task();
      left--;
    }
    if (left > 0) setTimeout(tick, every);
  };
  setTimeout(tick, 1500);
}

/** Asks iOS for the motion sensor, which it only allows from a tap, so shaking can find a secret. */
function askForMotion() {
  const motion = globalThis.DeviceMotionEvent as unknown as
    | { requestPermission?: () => Promise<string> }
    | undefined;
  motion?.requestPermission?.().catch(() => {});
}

/** A run of taps on the same thing, `needed` of them close enough together. */
function counter(needed: number, within: number) {
  let taps = 0;
  let first = 0;
  return () => {
    const now = Date.now();
    if (now - first > within) [taps, first] = [0, now];
    return ++taps === needed;
  };
}

export function startSecrets() {
  if (occasion) nowAndAgain(PARADES[occasion], 45_000, 4);

  // Tapping the bins at the top of the page makes them jump; five quick taps find a secret.
  const bounced = counter(5, 4000);
  const flicked = counter(4, 3000);
  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const bin = target?.closest('.hero-bins > *');
    if (bin) {
      jump(bin.firstElementChild);
      if (bounced()) {
        play('bounce', { x: event.clientX, y: event.clientY });
        askForMotion();
      }
    }
    // Flicking between light and dark, over and over.
    if (target?.closest('.theme-toggle') && flicked()) play('disco');
  });

  let code = 0;
  document.addEventListener('keydown', (event) => {
    code = konami(code, event.key);
    if (code === KONAMI_LENGTH) {
      code = 0;
      play('party');
    }
  });

  // Typing the bin's most loyal visitor into the address box.
  let chicken = false;
  document.addEventListener('input', (event) => {
    const field = event.target;
    if (!(field instanceof HTMLInputElement) || field.name !== 'address') return;
    const now = /bin ?chicken|\bibis\b/i.test(field.value);
    if (now && !chicken) play('ibis');
    chicken = now;
  });

  // A good shake of the phone: a burst of strong jolts within a second or so.
  const shaken = counter(10, 1200);
  addEventListener('devicemotion', (event) => {
    const g = event.accelerationIncludingGravity;
    if (g?.x == null || g.y == null || g.z == null) return;
    if (Math.abs(Math.hypot(g.x, g.y, g.z) - 9.81) > 14 && shaken()) play('quake');
  });

  // Leave the page alone for a while and a bin peeks up from the corner, once a visit.
  let peeked = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const rest = () => {
    clearTimeout(timer);
    if (!peeked) timer = setTimeout(peek, 40_000);
  };
  const peek = () => {
    if (document.hidden) return rest();
    peeked = true;
    sprite(
      BIN,
      [
        { transform: 'translateY(0)' },
        { transform: 'translateY(-75%) rotate(-8deg)', offset: 0.12 },
        { transform: 'translateY(-75%) rotate(6deg)', offset: 0.5 },
        { transform: 'translateY(-75%) rotate(-4deg)', offset: 0.88 },
        { transform: 'translateY(0)' },
      ],
      { duration: 9000, easing: 'ease-in-out' },
      { x: innerWidth - 90, y: innerHeight },
      (at) => play('peek', at),
    );
  };
  for (const type of ['pointerdown', 'keydown', 'scroll'])
    addEventListener(type, rest, { passive: true });
  rest();
}
