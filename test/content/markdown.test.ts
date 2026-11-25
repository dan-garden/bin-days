import { describe, expect, it } from 'vitest';
import { markdownToHtml, plainText } from '../../src/content/markdown.js';

describe('markdownToHtml', () => {
  it('turns headings, lists and paragraphs into HTML', () => {
    const html = markdownToHtml(`
## Before bin night

Put the bins out
the evening before.

- Lids **closed**
- Handles to the [kerb](/guides/kerb)

1. Look up your address
2. Add it to [your calendar](https://example.org/a?b=1&c=2)
`);
    expect(html.split('\n')).toEqual([
      '<h2>Before bin night</h2>',
      '<p>Put the bins out the evening before.</p>',
      '<ul><li>Lids <strong>closed</strong></li><li>Handles to the <a href="/guides/kerb">kerb</a></li></ul>',
      '<ol><li>Look up your address</li><li>Add it to <a href="https://example.org/a?b=1&amp;c=2" rel="noopener noreferrer">your calendar</a></li></ol>',
    ]);
  });

  it('escapes anything that looks like HTML', () => {
    expect(markdownToHtml('Bins <b>& lids</b>')).toBe('<p>Bins &lt;b&gt;&amp; lids&lt;/b&gt;</p>');
  });

  it('gives back the words alone', () => {
    expect(plainText(markdownToHtml('Fish & [chips](/c) **now**'))).toBe('Fish & chips now');
  });
});
