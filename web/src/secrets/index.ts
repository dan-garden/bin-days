import {
  KONAMI_LENGTH,
  konami,
  SEASONS,
  SECRETS,
  type Season,
  type SecretId,
  season,
} from './catalogue.js';
import {
  across,
  burst,
  confetti,
  honk,
  jump,
  type Point,
  rain,
  reduced,
  sprite,
  toast,
} from './fx.js';

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
const BIN = '<img src="/favicon.svg" alt="" width="48" height="48">';
const IBIS =
  '<svg viewBox="0 0 64 44" width="76" height="52"><path d="M27 34l-3 9M35 34l2 9" stroke="#333" stroke-width="2"/><ellipse cx="30" cy="25" rx="17" ry="10" fill="#f3f0e8"/><path d="M12 24l-10 6 13-1z" fill="#333"/><path d="M44 21q6-14 12-9" stroke="#222" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M57 13q4 5 5 17" stroke="#222" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>';

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
    `${hunt ? '🥚' : '♻️'} ${SECRETS[id].name}${first ? ` · ${found.size} of ${total} ${kind} found` : ''}`,
    SECRETS[id].fact,
  );
  // An Easter egg hunt: every find hatches eggs.
  if (hunt && id !== 'easter') burst(at, ['🥚', '🐣'], 4);
  if (first && found.size === total) confetti();
}

const middle = (): Point => ({ x: innerWidth / 2, y: innerHeight / 2 });

const EFFECTS: Record<SecretId, (at: Point) => void> = {
  easter: (at) => burst(at, ['🥚', '🐣', '🌷']),
  christmas: (at) => burst(at, ['🎁', '⭐', '🎄']),
  halloween: (at) => burst(at, ['🍬', '🎃', '🍭']),
  newyear: (at) => {
    confetti();
    burst(at, ['🎆', '✨']);
  },
  bounce: () => confetti(),
  party: (at) => {
    rain('🥫', 12);
    burst(at, ['♻️', '🥫', '📦', '📰'], 12);
  },
  quake: () => {
    if (!reduced())
      document.querySelector('.page')?.animate(
        [0, -12, 12, -9, 9, -4, 0].map((x) => ({ transform: `translateX(${x}px)` })),
        { duration: 600 },
      );
    rain(BIN, 14);
  },
  ibis: () => {
    across(IBIS, innerHeight - 110, { duration: 6500, bob: 6 });
    setTimeout(() => burst({ x: innerWidth / 2, y: innerHeight - 90 }, ['🍟'], 5), 2600);
  },
  disco: () => {
    if (!reduced())
      document.body.animate([{ filter: 'hue-rotate(0)' }, { filter: 'hue-rotate(360deg)' }], {
        duration: 1400,
        iterations: 2,
      });
  },
  peek: (at) => burst(at, ['👋', '💚']),
  binday: (at) => {
    confetti();
    burst(at, ['🎉', '🗑️', '🚛']);
  },
  truck: (at) => {
    honk();
    burst(at, ['💨', '🎺'], 5);
  },
  flies: (at) => burst(at, ['🪰', '🪰', '💨'], 6),
  lights: (at) => burst(at, ['💡', '✨'], 5),
  koala: (at) => {
    sprite(
      '🐨',
      [
        { transform: 'translate(-50%, 0) scale(0.3)' },
        { transform: 'translate(-50%, -90px) scale(1.4)', offset: 0.3 },
        { transform: 'translate(-50%, -90px) scale(1.4)', offset: 0.8 },
        { transform: 'translate(-50%, 0) scale(0.3)', opacity: 0 },
      ],
      { duration: 2200, easing: 'ease-out' },
      at,
    );
    burst(at, ['🍃', '🍂'], 6);
  },
};

/** Plays a secret (at the spot it was found, if it has one) and counts it as found. */
export function play(id: SecretId, at: Point = middle()) {
  EFFECTS[id](at);
  find(id, at);
}

/** What turns up on each occasion: something to catch as it goes by, with a bit of scenery. */
const PARADES: Record<Season, () => void> = {
  easter: () =>
    across('🐇', innerHeight - 100, { duration: 7000, bob: 40, onTap: (at) => play('easter', at) }),
  christmas: () => {
    rain('❄️', 24, 9000);
    across('🎅', 90, { duration: 9000, bob: 14, onTap: (at) => play('christmas', at) });
  },
  halloween: () => {
    for (let i = 0; i < 5; i++) across('🦇', 60 + i * 70, { duration: 5000 + i * 900, bob: 30 });
    across('🦇', innerHeight / 2, {
      duration: 6000,
      bob: 40,
      onTap: (at) => play('halloween', at),
    });
  },
  newyear: () => {
    confetti();
    across('🥳', innerHeight / 2, { duration: 7000, bob: 24, onTap: (at) => play('newyear', at) });
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
