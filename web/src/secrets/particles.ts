import { LID_PAINT } from '../lib.js';

/**
 * Drawn particles for the secrets: confetti, sparks, gum leaves, flies, eggs, cans, chips and
 * little wheelie bins, on one canvas over the page. It only draws while something is moving, and
 * never takes a tap.
 */

export type Kind = 'confetti' | 'spark' | 'leaf' | 'fly' | 'egg' | 'can' | 'chip' | 'bin';

interface Particle {
  kind: Kind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  spin: number;
  size: number;
  colour: string;
  age: number;
  life: number;
}

const LIDS = Object.values(LID_PAINT);
const EGGS = ['#ffc9de', '#c5f6fa', '#fff3bf', '#d3f9d8', '#e5dbff'];
/** Pulls down, in pixels a second per second; sparks and flies hang in the air. */
const GRAVITY: Record<Kind, number> = {
  confetti: 260,
  spark: 60,
  leaf: 120,
  fly: 0,
  egg: 700,
  can: 800,
  chip: 700,
  bin: 900,
};
const MAX = 500;

const random = (from: number, to: number) => from + Math.random() * (to - from);
const pick = <T>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)] as T;

let canvas: HTMLCanvasElement | undefined;
let paint: CanvasRenderingContext2D | null = null;
const live: Particle[] = [];
let last = 0;

function resize() {
  if (!canvas) return;
  const ratio = Math.min(devicePixelRatio || 1, 2);
  canvas.width = innerWidth * ratio;
  canvas.height = innerHeight * ratio;
  paint?.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function start() {
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.className = 'secrets-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.append(canvas);
    paint = canvas.getContext('2d');
    resize();
    addEventListener('resize', resize);
  }
  if (!last) {
    last = performance.now();
    requestAnimationFrame(frame);
  }
}

function colourFor(kind: Kind) {
  if (kind === 'egg') return pick(EGGS);
  // Sunshine gold; fireworks set their own colour.
  if (kind === 'spark') return pick(['#ffd43b', '#ffe066', '#fff3bf']);
  if (kind === 'leaf') return pick(['#5c940d', '#74b816', '#8ca07a']);
  return pick(LIDS);
}

/** Adds `count` particles of `kind` at a point, thrown up and out at about `speed`. */
export function emit(kind: Kind, x: number, y: number, count: number, speed = 260) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  for (let i = 0; i < count && live.length < MAX; i++) {
    const angle = random(-Math.PI * 0.95, -Math.PI * 0.05);
    const pace = random(0.35, 1) * speed;
    live.push({
      kind,
      x,
      y,
      vx: Math.cos(angle) * pace,
      vy: Math.sin(angle) * pace,
      angle: random(0, Math.PI * 2),
      spin: random(-8, 8),
      size: kind === 'bin' ? random(18, 26) : kind === 'can' ? random(12, 16) : random(6, 11),
      colour: colourFor(kind),
      age: 0,
      life: kind === 'fly' ? random(2.5, 4) : kind === 'spark' ? random(0.8, 1.6) : random(2, 3.2),
    });
  }
  start();
}

/** Particles falling from the top of the screen, spread across it and over `seconds`. */
export function shower(kind: Kind, count: number, seconds = 1.5) {
  for (let i = 0; i < count; i++)
    setTimeout(
      () => {
        emit(kind, random(0, innerWidth), -20, 1, 40);
        const added = live[live.length - 1];
        if (added) {
          added.vy = random(40, 140);
          added.life = 6;
        }
      },
      random(0, seconds * 1000),
    );
}

/** Confetti in the lid colours, from the top. */
export const confetti = () => shower('confetti', 110, 1.2);

/** A firework: a ring of sparks bursting at a point. */
export function firework(x: number, y: number) {
  const colour = pick(LIDS);
  const before = live.length;
  emit('spark', x, y, 36, 0);
  live.slice(before).forEach((spark, i, all) => {
    const angle = (i / all.length) * Math.PI * 2;
    spark.vx = Math.cos(angle) * random(140, 190);
    spark.vy = Math.sin(angle) * random(140, 190);
    spark.colour = colour;
  });
}

function draw(c: CanvasRenderingContext2D, p: Particle) {
  const s = p.size;
  c.fillStyle = p.colour;
  switch (p.kind) {
    case 'confetti':
      // A strip of paper turning over as it falls.
      c.scale(1, Math.cos(p.age * 9 + p.angle));
      c.fillRect(-s / 2, -s / 4, s, s / 2);
      break;
    case 'spark':
      c.globalCompositeOperation = 'lighter';
      c.beginPath();
      c.arc(0, 0, s / 3, 0, Math.PI * 2);
      c.fill();
      c.globalAlpha *= 0.35;
      c.beginPath();
      c.arc(0, 0, s * 0.8, 0, Math.PI * 2);
      c.fill();
      break;
    case 'leaf':
      // A gum leaf: long, thin and curved.
      c.beginPath();
      c.ellipse(0, 0, s, s / 3.2, 0, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = 'rgb(255 255 255 / 0.35)';
      c.lineWidth = 0.8;
      c.beginPath();
      c.moveTo(-s, 0);
      c.lineTo(s, 0);
      c.stroke();
      break;
    case 'fly': {
      const flap = Math.abs(Math.sin(p.age * 70));
      c.fillStyle = 'rgb(210 225 255 / 0.7)';
      c.beginPath();
      c.ellipse(-2.5, -2.5, 3.2, 1.6 + flap * 1.2, -0.6, 0, Math.PI * 2);
      c.ellipse(2.5, -2.5, 3.2, 1.6 + flap * 1.2, 0.6, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#1d1a1f';
      c.beginPath();
      c.ellipse(0, 0, 2.4, 3.2, 0, 0, Math.PI * 2);
      c.fill();
      break;
    }
    case 'egg':
      c.beginPath();
      c.ellipse(0, 0, s * 0.75, s, 0, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = 'rgb(255 255 255 / 0.9)';
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(-s * 0.7, 0);
      for (let i = 1; i <= 6; i++) c.lineTo(-s * 0.7 + (i * s * 1.4) / 6, i % 2 ? -2.5 : 0);
      c.stroke();
      break;
    case 'can':
      c.fillStyle = '#ced4da';
      c.fillRect(-s / 3, -s / 2, (s * 2) / 3, s);
      c.fillStyle = p.colour;
      c.fillRect(-s / 3, -s / 6, (s * 2) / 3, s / 3);
      c.fillStyle = '#868e96';
      c.fillRect(-s / 3, -s / 2, (s * 2) / 3, 2);
      break;
    case 'chip':
      c.fillStyle = '#f5c542';
      c.fillRect(-1.6, -s * 0.8, 3.2, s * 1.6);
      break;
    case 'bin':
      // A wheelie bin: dark body, coloured lid, two wheels.
      c.fillStyle = '#3a3f4a';
      c.fillRect(-s * 0.35, -s * 0.35, s * 0.7, s * 0.85);
      c.fillStyle = p.colour;
      c.fillRect(-s * 0.42, -s * 0.5, s * 0.84, s * 0.17);
      c.fillStyle = '#111';
      c.beginPath();
      c.arc(-s * 0.22, s * 0.52, s * 0.1, 0, Math.PI * 2);
      c.arc(s * 0.22, s * 0.52, s * 0.1, 0, Math.PI * 2);
      c.fill();
      break;
  }
}

function frame(now: number) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  const c = paint;
  if (!c || !canvas) return;
  c.clearRect(0, 0, innerWidth, innerHeight);
  for (let i = live.length - 1; i >= 0; i--) {
    const p = live[i] as Particle;
    p.age += dt;
    if (p.kind === 'fly') {
      // Buzzing about at random.
      p.vx += random(-900, 900) * dt;
      p.vy += random(-900, 900) * dt - 40 * dt;
      p.vx *= 0.96;
      p.vy *= 0.96;
    } else if (p.kind === 'leaf' || p.kind === 'confetti') {
      // Fluttering: air resistance, and a sway from side to side.
      p.vx = p.vx * 0.97 + Math.sin(p.age * 4 + p.angle) * 12;
      p.vy = Math.min(p.vy, 160);
    }
    p.vy += GRAVITY[p.kind] * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.angle += p.spin * dt;
    if (p.age > p.life || p.y > innerHeight + 60) {
      live.splice(i, 1);
      continue;
    }
    c.save();
    c.globalAlpha = Math.min(1, (p.life - p.age) / 0.5);
    c.translate(p.x, p.y);
    if (p.kind !== 'fly') c.rotate(p.angle);
    draw(c, p);
    c.restore();
  }
  if (live.length) requestAnimationFrame(frame);
  else {
    last = 0;
    c.clearRect(0, 0, innerWidth, innerHeight);
  }
}
