import { escapeHtml } from './markdown.js';

/**
 * Drawings for the kids' guides, as inline SVG built on the server: the site's own wheelie bin
 * (the same shape as the UI's `BinIcon`) and simple drawings of everyday things, in the lid colours.
 * Each is a `<figure>` with a caption, and every drawing has a text label, so nothing is said by
 * the picture alone. Styled by `.illustration` and `.journey` in web/src/styles.css.
 */

export const LID = {
  red: '#e03131',
  yellow: '#fcc419',
  lime: '#82c91e',
  purple: '#9c36b5',
  blue: '#228be6',
} as const;
export type Lid = keyof typeof LID;

/** A wheelie bin, 64 by 72 at scale 1, standing with its wheel at the bottom right. */
export function binSvg(lid: Lid, x = 0, y = 0, scale = 1): string {
  const paint = LID[lid];
  return `<g transform="translate(${x} ${y}) scale(${scale})"><ellipse cx="32" cy="67" rx="19" ry="3" fill="#000" opacity=".15"/><circle cx="45" cy="62" r="6" fill="#1b1f1d"/><circle cx="45" cy="62" r="2.2" fill="#9aa59f"/><path d="M15 25H49L45.5 60Q45.2 64 41.5 64H22.5Q18.8 64 18.5 60Z" fill="#2f3b36"/><path d="M25 32L26.3 57M39 32L37.7 57" stroke="#000" stroke-opacity=".25" stroke-width="1.5"/><path d="M11 27V22Q11 16 17 16H47Q53 16 53 22V27Z" fill="${paint}"/><path d="M10 23H54V25.5Q54 27.5 52 27.5H12Q10 27.5 10 25.5Z" fill="#000" opacity=".2"/><rect x="51.5" y="18" width="6" height="3.4" rx="1.7" fill="${paint}"/><path d="M18 19.6H36" stroke="#fff" stroke-opacity=".5" stroke-width="2" stroke-linecap="round"/></g>`;
}

/** Everyday things, each drawn in a 40 by 40 box. */
export const THINGS = {
  bottle:
    '<path d="M16 4h8v7q6 4 6 11v12q0 3-3 3H13q-3 0-3-3V22q0-7 6-11z" fill="#a5d8ff" stroke="#1971c2" stroke-width="2"/><rect x="15" y="1" width="10" height="5" rx="1.5" fill="#1971c2"/><rect x="10" y="20" width="20" height="8" fill="#fff" opacity=".7"/>',
  can: '<rect x="11" y="6" width="18" height="30" rx="4" fill="#ced4da" stroke="#868e96" stroke-width="2"/><rect x="11" y="15" width="18" height="11" fill="#e03131"/><path d="M14 8h12" stroke="#868e96" stroke-width="2"/>',
  box: '<path d="M5 14l15-7 15 7v16l-15 7-15-7z" fill="#d9a066" stroke="#8a5a2b" stroke-width="2" stroke-linejoin="round"/><path d="M5 14l15 7 15-7M20 21v16" stroke="#8a5a2b" stroke-width="2" fill="none"/>',
  paper:
    '<rect x="7" y="5" width="26" height="30" rx="2" fill="#fff" stroke="#868e96" stroke-width="2"/><path d="M11 12h18M11 17h18M11 22h12M11 27h15" stroke="#adb5bd" stroke-width="2"/>',
  jar: '<rect x="10" y="4" width="20" height="6" rx="2" fill="#f59f00"/><path d="M11 10h18q3 2 3 6v15q0 5-5 5H13q-5 0-5-5V16q0-4 3-6z" fill="#d0ebff" stroke="#74c0fc" stroke-width="2"/>',
  apple:
    '<path d="M20 12c-5-4-13-2-13 7 0 9 6 16 13 13 7 3 13-4 13-13 0-9-8-11-13-7z" fill="#e03131"/><path d="M20 12q0-5 4-7" stroke="#5c3d2e" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M22 8q6-3 9 1-5 3-9-1z" fill="#2f9e44"/>',
  banana:
    '<path d="M7 10q3 22 26 22-4 5-12 4C10 34 4 22 7 10z" fill="#ffd43b" stroke="#e67700" stroke-width="2" stroke-linejoin="round"/>',
  leaf: '<path d="M8 32C6 14 18 6 34 6c0 16-8 28-26 26z" fill="#74b816"/><path d="M8 32L26 14" stroke="#fff" stroke-opacity=".6" stroke-width="2"/>',
  chips:
    '<path d="M9 6h22l-2 6 2 6-2 6 2 6-2 6H9l2-6-2-6 2-6-2-6 2-6z" fill="#f59f00" stroke="#c77700" stroke-width="2" stroke-linejoin="round"/><circle cx="20" cy="20" r="5" fill="#fff3bf"/>',
  nappy:
    '<path d="M5 10h30v8q-4 14-15 14T5 18z" fill="#fff" stroke="#74c0fc" stroke-width="2"/><path d="M5 12h30" stroke="#74c0fc" stroke-width="3"/>',
  battery:
    '<rect x="8" y="10" width="22" height="20" rx="3" fill="#343a40" stroke="#adb5bd" stroke-width="1.5"/><rect x="30" y="16" width="4" height="8" rx="1" fill="#adb5bd"/><path d="M15 20h8M19 16v8" stroke="#fcc419" stroke-width="2.5"/>',
  bag: '<path d="M8 14h24l-2 22H10z" fill="#e9ecef" stroke="#adb5bd" stroke-width="2" stroke-linejoin="round"/><path d="M14 14q0-9 6-9t6 9" stroke="#adb5bd" stroke-width="2" fill="none"/>',
  shirt:
    '<path d="M13 5l-8 6 4 6 4-2v20h14V15l4 2 4-6-8-6q-3 4-7 4t-7-4z" fill="#4dabf7" stroke="#1971c2" stroke-width="2" stroke-linejoin="round"/>',
  phone:
    '<rect x="12" y="3" width="16" height="34" rx="3" fill="#343a40" stroke="#adb5bd" stroke-width="1.5"/><rect x="14" y="7" width="12" height="23" fill="#74c0fc"/><circle cx="20" cy="33.5" r="1.5" fill="#adb5bd"/>',
  cup: '<path d="M10 10h20l-3 26H13z" fill="#fff" stroke="#868e96" stroke-width="2" stroke-linejoin="round"/><rect x="8" y="6" width="24" height="5" rx="2" fill="#495057"/><rect x="12" y="18" width="16" height="7" fill="#a9744f"/>',
  tissue:
    '<path d="M8 16h24v18H8z" fill="#e7f5ff" stroke="#74c0fc" stroke-width="2"/><path d="M16 16q4-12 8 0" fill="#fff" stroke="#adb5bd" stroke-width="2"/>',
  flat: '<path d="M4 26l16-6 16 6-16 6z" fill="#d9a066" stroke="#8a5a2b" stroke-width="2" stroke-linejoin="round"/><path d="M12 14l8 4 8-4M20 10v8" stroke="#495057" stroke-width="2.5" fill="none" stroke-linecap="round"/>',
  rinse:
    '<path d="M20 4q8 10 8 16a8 8 0 0 1-16 0q0-6 8-16z" fill="#74c0fc"/><path d="M16 21q1 4 5 4" stroke="#fff" stroke-width="2" fill="none"/>',
  milk: '<path d="M14 4h12v6l4 6v20H10V16l4-6z" fill="#fff" stroke="#868e96" stroke-width="2" stroke-linejoin="round"/><rect x="15" y="1" width="10" height="4" rx="1" fill="#4dabf7"/><rect x="10" y="20" width="20" height="8" fill="#4dabf7"/>',
} as const;
export type Thing = keyof typeof THINGS;

const thingSvg = (thing: Thing, x: number, y: number, size = 40) =>
  `<g transform="translate(${x} ${y}) scale(${size / 40})">${THINGS[thing]}</g>`;

const figure = (className: string, svg: string, caption: string) =>
  `<figure class="${className}">${svg}<figcaption>${escapeHtml(caption)}</figcaption></figure>`;

/** A bin with the things that go in it beside it, each labelled. */
export function binWith(lid: Lid, things: Array<[Thing, string]>, caption: string): string {
  const width = 120 + things.length * 104;
  const items = things
    .map(
      ([thing, label], i) =>
        `${thingSvg(thing, 126 + i * 104, 24, 48)}<text x="${150 + i * 104}" y="96" text-anchor="middle" font-size="12">${escapeHtml(label)}</text>`,
    )
    .join('');
  const svg = `<svg viewBox="0 0 ${width} 110" role="img" aria-label="${escapeHtml(caption)}">${binSvg(lid, 6, 4, 1.4)}${items}</svg>`;
  return figure('illustration', svg, caption);
}

/** The usual four bins in a row, each with its name. */
export function binRow(bins: Array<[Lid, string]>, caption: string): string {
  const svg = `<svg viewBox="0 0 ${bins.length * 110} 132" role="img" aria-label="${escapeHtml(caption)}">${bins
    .map(
      ([lid, label], i) =>
        `${binSvg(lid, 10 + i * 110, 0, 1.4)}<text x="${55 + i * 110}" y="124" text-anchor="middle">${escapeHtml(label)}</text>`,
    )
    .join('')}</svg>`;
  return figure('illustration', svg, caption);
}

/** Steps from top (best) to bottom (last resort), each narrower than the one before, like a funnel. */
export function hierarchy(steps: Array<[string, string]>, caption: string): string {
  const colours = ['#1e6b30', '#0b7285', '#4a7a0a', '#b35c00', '#c92a2a', '#862e9c'];
  const rows = steps
    .map(
      ([name, note], i) =>
        `<li style="width:${100 - i * 9}%;background:${colours[i % colours.length]}"><strong>${escapeHtml(name)}</strong><span>${escapeHtml(note)}</span></li>`,
    )
    .join('');
  return `<figure class="illustration hierarchy"><ol>${rows}</ol><figcaption>${escapeHtml(caption)}</figcaption></figure>`;
}

/** Icons for the stops along a journey. */
const STOPS = {
  home: '<path d="M6 20L20 8l14 12v14H6z" fill="#ffe0a3" stroke="#5b4a6b" stroke-width="2" stroke-linejoin="round"/><path d="M3 21L20 6l17 15" stroke="#5b4a6b" stroke-width="3" fill="none" stroke-linecap="round"/><rect x="17" y="24" width="6" height="10" fill="#5b4a6b"/>',
  truck:
    '<rect x="2" y="12" width="22" height="16" rx="2" fill="#2b8a3e"/><path d="M24 17h8l5 6v5H24z" fill="#37b24d"/><rect x="27" y="19" width="5" height="4" fill="#d0ebff"/><circle cx="10" cy="30" r="4" fill="#212529"/><circle cx="30" cy="30" r="4" fill="#212529"/>',
  sort: '<rect x="3" y="20" width="34" height="8" rx="4" fill="#868e96"/><circle cx="9" cy="24" r="2" fill="#495057"/><circle cx="31" cy="24" r="2" fill="#495057"/><rect x="8" y="12" width="7" height="8" fill="#fcc419"/><circle cx="21" cy="16" r="4" fill="#74c0fc"/><rect x="27" y="13" width="5" height="7" fill="#ced4da"/><path d="M12 34h16" stroke="#495057" stroke-width="2"/>',
  factory:
    '<path d="M4 34V18l9 6v-6l9 6v-6l9 6V8h5v26z" fill="#adb5bd" stroke="#495057" stroke-width="2" stroke-linejoin="round"/><path d="M33 6q2-4 6-3" stroke="#ced4da" stroke-width="2.5" fill="none"/>',
  new: '<path d="M16 4h8v7q6 4 6 11v12q0 3-3 3H13q-3 0-3-3V22q0-7 6-11z" fill="#b2f2bb" stroke="#2b8a3e" stroke-width="2"/><path d="M15 22l4 4 7-8" stroke="#2b8a3e" stroke-width="3" fill="none" stroke-linecap="round"/>',
  compost:
    '<path d="M3 34q17-26 34 0z" fill="#5c3d2e"/><path d="M14 22q3-6 6-2M22 18q3-5 7 0" stroke="#74b816" stroke-width="3" fill="none" stroke-linecap="round"/>',
  farm: '<path d="M2 34h36" stroke="#5c3d2e" stroke-width="3"/><path d="M10 34V20M10 22q-6-2-6-8 6 0 6 8zM10 24q6-2 6-8-6 0-6 8zM28 34V18M28 20q-6-2-6-8 6 0 6 8zM28 22q6-2 6-8-6 0-6 8z" stroke="#2b8a3e" stroke-width="2" fill="#74b816"/>',
  landfill:
    '<path d="M2 34q10-20 18-14t18 14z" fill="#8c8a7a"/><path d="M8 34q8-10 14-6" stroke="#5c5a4e" stroke-width="2" fill="none"/><circle cx="26" cy="10" r="3" fill="#ced4da"/><circle cx="31" cy="6" r="2" fill="#ced4da"/>',
} as const;
export type Stop = keyof typeof STOPS;

/** A journey in steps, left to right (top to bottom on a phone), each with a drawing. */
export function journey(steps: Array<[Stop, string, string]>, caption: string): string {
  const items = steps
    .map(
      ([stop, name, note]) =>
        `<li><svg viewBox="0 0 40 40" width="56" height="56" aria-hidden="true">${STOPS[stop]}</svg><strong>${escapeHtml(name)}</strong><span class="journey-note">${escapeHtml(note)}</span></li>`,
    )
    .join('');
  return `<figure class="journey"><ol>${items}</ol><figcaption>${escapeHtml(caption)}</figcaption></figure>`;
}

/** A row of things with a tick or a cross: what goes in, and what stays out. */
export function yesNo(yes: Array<[Thing, string]>, no: Array<[Thing, string]>, caption: string) {
  const cell = ([thing, label]: [Thing, string], ok: boolean) =>
    `<li class="${ok ? 'yes' : 'no'}"><svg viewBox="0 0 40 40" width="48" height="48" aria-hidden="true">${THINGS[thing]}</svg><span>${ok ? 'Yes' : 'No'}: ${escapeHtml(label)}</span></li>`;
  return `<figure class="yes-no"><ul>${[...yes.map((t) => cell(t, true)), ...no.map((t) => cell(t, false))].join('')}</ul><figcaption>${escapeHtml(caption)}</figcaption></figure>`;
}

/** A bin truck at the kerb, its robot arm lifting a bin to tip it in. */
export function truckScene(lid: Lid, caption: string): string {
  return figure('illustration', truckSvg(lid, caption), caption);
}

/** The bin truck drawing on its own, 420 by 170, as `truckScene` and the share images use it. */
export function truckSvg(lid: Lid, label: string): string {
  return `<svg viewBox="0 0 420 170" role="img" aria-label="${escapeHtml(label)}"><rect x="0" y="138" width="420" height="32" fill="#4a4656"/><path d="M0 152h420" stroke="#fcc419" stroke-width="3" stroke-dasharray="22 18"/><rect x="0" y="128" width="420" height="10" fill="#e8e2d8"/><g><rect x="40" y="50" width="190" height="80" rx="8" fill="#2b8a3e"/><rect x="40" y="70" width="190" height="8" fill="#ffd43b"/><path d="M230 70h50q14 0 22 16l14 26v18H230z" fill="#37b24d"/><path d="M246 78h30q8 0 12 10l8 18h-50z" fill="#d0ebff"/><circle cx="90" cy="132" r="18" fill="#212529"/><circle cx="90" cy="132" r="7" fill="#868e96"/><circle cx="270" cy="132" r="18" fill="#212529"/><circle cx="270" cy="132" r="7" fill="#868e96"/><rect x="310" y="110" width="10" height="8" rx="2" fill="#fff3bf"/></g><path d="M200 60l40-36 40 18" stroke="#495057" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="240" cy="24" r="7" fill="#868e96"/>${binSvg(lid, 268, 10, 0.9).replace('<g transform="', '<g transform="rotate(-35 300 40) ')}</svg>`;
}

/** Tips as small illustrated cards: a drawing, a short title and a line or two. */
export function tipCards(cards: Array<[Thing, string, string]>): string {
  return `<ul class="tip-cards">${cards
    .map(
      ([thing, title, text]) =>
        `<li><svg viewBox="0 0 40 40" width="56" height="56" aria-hidden="true">${THINGS[thing]}</svg><strong>${escapeHtml(title)}</strong><span>${escapeHtml(text)}</span></li>`,
    )
    .join('')}</ul>`;
}

/** Numbered drawings, for a quiz: each question's thing, with its number. */
export function quizCards(things: Array<[Thing, string]>, caption: string): string {
  return `<figure class="yes-no quiz"><ul>${things
    .map(
      ([thing, label], i) =>
        `<li><b>${i + 1}</b><svg viewBox="0 0 40 40" width="48" height="48" aria-hidden="true">${THINGS[thing]}</svg><span>${escapeHtml(label)}</span></li>`,
    )
    .join('')}</ul><figcaption>${escapeHtml(caption)}</figcaption></figure>`;
}
