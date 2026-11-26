import { LID_PAINT } from '../lib.js';

/**
 * What the secrets play: things that fly, hop or fall over the page, a honk and a toast. All of it
 * runs on a layer that never takes a tap except on the thing to tap, and the movement is left out
 * for people who ask their system for reduced motion.
 */

export interface Point {
  x: number;
  y: number;
}

export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const random = (from: number, to: number) => from + Math.random() * (to - from);

let layer: HTMLElement | undefined;
function stage() {
  if (!layer) {
    layer = document.createElement('div');
    layer.className = 'secrets';
    layer.setAttribute('aria-hidden', 'true');
    document.body.append(layer);
  }
  return layer;
}

/**
 * Something that plays its moves once from `at`, then goes. `html` is always the site's own
 * markup, never anything typed. With `onTap`, it can be tapped (or clicked) to find a secret.
 */
export function sprite(
  html: string,
  moves: Keyframe[],
  timing: KeyframeAnimationOptions,
  at: Point,
  onTap?: (at: Point) => void,
) {
  if (reduced()) return;
  const thing = document.createElement('span');
  thing.className = onTap ? 'secret-sprite secret-tap' : 'secret-sprite';
  thing.innerHTML = html;
  thing.style.left = `${at.x}px`;
  thing.style.top = `${at.y}px`;
  stage().append(thing);
  const done = () => thing.remove();
  thing.animate(moves, { fill: 'forwards', ...timing }).finished.then(done, done);
  if (onTap)
    thing.addEventListener(
      'pointerdown',
      (event) => {
        done();
        onTap({ x: event.clientX, y: event.clientY });
      },
      { once: true },
    );
}

/** A handful of `pieces` thrown up from a point, which tumble and fade. */
export function burst(at: Point, pieces: string[], count = 8) {
  for (let i = 0; i < count; i++) {
    const [dx, dy] = [random(-130, 130), random(-170, -50)];
    sprite(
      pieces[i % pieces.length] ?? '',
      [
        { transform: 'translate(-50%, -50%) scale(0.4)' },
        { transform: `translate(${dx}px, ${dy}px) scale(1)`, offset: 0.45 },
        { transform: `translate(${dx * 1.3}px, ${dy + 160}px) rotate(${dx}deg)`, opacity: 0 },
      ],
      { duration: random(1000, 1500), easing: 'cubic-bezier(.2,.7,.4,1)' },
      at,
    );
  }
}

/** `count` copies of `html` falling from the top of the screen, spinning as they go. */
export function rain(html: string, count: number, duration = 3000) {
  for (let i = 0; i < count; i++) {
    sprite(
      html,
      [
        { transform: 'translateY(-60px) rotate(0)' },
        {
          transform: `translate(${random(-80, 80)}px, ${innerHeight + 60}px) rotate(${random(-540, 540)}deg)`,
        },
      ],
      { duration: random(duration * 0.6, duration), delay: random(0, duration / 3) },
      { x: random(0, innerWidth), y: 0 },
    );
  }
}

/** Confetti in the lid colours. */
export function confetti() {
  for (const colour of Object.values(LID_PAINT)) rain(`<i style="background:${colour}"></i>`, 16);
}

/** Something that crosses the screen at height `y`, bobbing (or hopping) `bob` pixels as it goes. */
export function across(
  html: string,
  y: number,
  {
    duration = 7000,
    bob = 20,
    onTap,
  }: { duration?: number; bob?: number; onTap?: (at: Point) => void },
) {
  const steps = 16;
  const moves = Array.from({ length: steps + 1 }, (_, i) => ({
    transform: `translate(${-80 + ((innerWidth + 160) * i) / steps}px, ${i % 2 ? -bob : 0}px)`,
  }));
  sprite(html, moves, { duration }, { x: 0, y }, onTap);
}

/** A little bounce on an element of the page itself. */
export function jump(element: Element | null | undefined) {
  if (reduced() || !element) return;
  element.animate(
    [
      { transform: 'none' },
      { transform: 'translateY(-26px) rotate(-10deg)', offset: 0.4 },
      { transform: 'none' },
    ],
    { duration: 480, easing: 'ease-out' },
  );
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;
/** A short message at the bottom of the screen, read out by screen readers too. */
export function toast(title: string, detail: string) {
  let note = document.querySelector<HTMLElement>('.secret-toast');
  if (!note) {
    note = document.createElement('div');
    note.className = 'secret-toast';
    note.setAttribute('role', 'status');
    document.body.append(note);
  }
  const [heading, body] = [document.createElement('strong'), document.createElement('span')];
  heading.textContent = title;
  body.textContent = detail;
  note.replaceChildren(heading, body);
  note.classList.add('shown');
  clearTimeout(toastTimer);
  // Long enough to read the fact out to a child.
  toastTimer = setTimeout(() => note.classList.remove('shown'), 7000);
}

let sound: AudioContext | undefined;
/** The bin truck's horn: two short notes. Only ever played on a tap, never by itself. */
export function honk() {
  try {
    sound ??= new AudioContext();
    const now = sound.currentTime;
    for (const [start, pitch] of [
      [0, 392],
      [0.22, 330],
    ] as const) {
      const note = sound.createOscillator();
      const volume = sound.createGain();
      note.type = 'square';
      note.frequency.value = pitch;
      volume.gain.setValueAtTime(0.0001, now + start);
      volume.gain.exponentialRampToValueAtTime(0.1, now + start + 0.02);
      volume.gain.exponentialRampToValueAtTime(0.0001, now + start + 0.18);
      note.connect(volume).connect(sound.destination);
      note.start(now + start);
      note.stop(now + start + 0.2);
    }
  } catch {} // no sound is fine
}
