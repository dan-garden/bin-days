import { escapeHtml } from './markdown.js';

/**
 * Charts for the written pages, as plain HTML and CSS (`.chart` in web/src/styles.css): nothing to
 * load, readable without JavaScript or colour, and the same on the server and in the UI. Every bar
 * carries its number as text, and hovering one shows its full count.
 */

const percent = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);

const figure = (title: string, body: string, note?: string) =>
  `<figure class="chart"><figcaption>${escapeHtml(title)}</figcaption>${body}${
    note ? `<p class="chart-note">${escapeHtml(note)}</p>` : ''
  }</figure>`;

export interface Share {
  label: string;
  value: number;
  /** What `value` is out of. */
  of: number;
}

/** One bar per row, as a share of its own whole: "28 of 63 councils, 44%". */
export function shareBars(title: string, rows: Share[], note?: string): string {
  const body = rows
    .map(({ label, value, of }) => {
      const share = percent(value, of);
      return `<div class="chart-row" title="${escapeHtml(`${label}: ${value} of ${of} councils (${share}%)`)}"><span class="chart-label">${escapeHtml(label)}</span><span class="chart-track"><span class="chart-bar" style="width:${share}%"></span></span><span class="chart-value">${share}% <small>${value} of ${of}</small></span></div>`;
    })
    .join('');
  return figure(title, body, note);
}

export interface Stack {
  label: string;
  /** Count per part, in the order of the chart's parts. */
  values: number[];
}

/**
 * One bar per row, split into parts that make up 100%, with a legend. Parts are shaded darkest
 * first (`chart-part-0`...), so order them most to least.
 */
export function stackedBars(title: string, parts: string[], rows: Stack[], note?: string): string {
  const legend = `<ul class="chart-legend">${parts
    .map((part, i) => `<li><span class="chart-part-${i}"></span>${escapeHtml(part)}</li>`)
    .join('')}</ul>`;
  const body = rows
    .map(({ label, values }) => {
      const whole = values.reduce((sum, value) => sum + value, 0);
      const segments = values
        .map((value, i) => {
          if (!value) return '';
          const share = percent(value, whole);
          const tip = `${label}, ${parts[i]}: ${value} of ${whole} councils (${share}%)`;
          // Only label a part wide enough to hold its number; the hover has the rest.
          return `<span class="chart-part-${i}" style="width:${(value / whole) * 100}%" title="${escapeHtml(tip)}">${share >= 9 ? `${share}%` : ''}</span>`;
        })
        .join('');
      return `<div class="chart-row"><span class="chart-label">${escapeHtml(label)}</span><span class="chart-stack">${segments}</span><span class="chart-value"><small>${whole}</small></span></div>`;
    })
    .join('');
  return figure(title, legend + body, note);
}

/** A plain table, for the numbers behind a chart and for anyone reading it aloud. */
export function table(
  head: string[],
  rows: Array<Array<string | number>>,
  caption?: string,
): string {
  const cells = (row: Array<string | number>, tag: string) =>
    `<tr>${row.map((cell) => `<${tag}>${escapeHtml(String(cell))}</${tag}>`).join('')}</tr>`;
  return `<div class="table-scroll"><table>${caption ? `<caption>${escapeHtml(caption)}</caption>` : ''}<thead>${cells(head, 'th')}</thead><tbody>${rows.map((row) => cells(row, 'td')).join('')}</tbody></table></div>`;
}

/** A few headline numbers in a row. */
export const stats = (items: Array<{ value: string; label: string }>) =>
  `<dl class="stat-tiles">${items
    .map(
      ({ value, label }) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`,
    )
    .join('')}</dl>`;
