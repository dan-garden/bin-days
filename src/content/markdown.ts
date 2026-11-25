/**
 * A small Markdown subset for the site's own written pages and answers, turned
 * into HTML the same way on the server and in the UI. Blocks are separated by
 * a blank line: `## ` and `### ` headings, lists of `- ` or `1. ` lines, and
 * paragraphs. Inline: `**bold**` and `[links](/path)`. No dependencies, so the
 * UI can bundle it. Only for text written in this repository: it is not a
 * sanitiser for text from anywhere else.
 */

export const escapeHtml = (text: string) =>
  text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

function inline(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label: string, href: string) =>
      // Links off the site open as usual but don't tell the other site where the visitor came from.
      /^https?:/.test(href)
        ? `<a href="${href}" rel="noopener noreferrer">${label}</a>`
        : `<a href="${href}">${label}</a>`,
    );
}

const LIST = /^(- |\d+\. )/;

export function markdownToHtml(markdown: string): string {
  return markdown
    .trim()
    .split(/\n\s*\n/)
    .map((block) => {
      const lines = block.trim().split('\n');
      const [first = ''] = lines;
      if (first.startsWith('### ')) return `<h3>${inline(first.slice(4))}</h3>`;
      if (first.startsWith('## ')) return `<h2>${inline(first.slice(3))}</h2>`;
      if (lines.every((line) => LIST.test(line))) {
        const tag = first.startsWith('- ') ? 'ul' : 'ol';
        const items = lines.map((line) => `<li>${inline(line.replace(LIST, ''))}</li>`);
        return `<${tag}>${items.join('')}</${tag}>`;
      }
      return `<p>${inline(lines.join(' '))}</p>`;
    })
    .join('\n');
}

/** The words of some HTML, for places that take plain text (search engines' structured data). */
export const plainText = (html: string) =>
  html
    .replace(/<[^>]+>/g, '')
    .replace(
      /&(amp|lt|gt|quot);/g,
      (_, entity: string) => ({ amp: '&', lt: '<', gt: '>', quot: '"' })[entity]!,
    );
