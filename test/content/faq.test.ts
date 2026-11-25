import { describe, expect, it } from 'vitest';
import { placeFaq } from '../../src/content/faq.js';
import { describeBins, howOften } from '../../src/councils/bins.js';

describe('bin wording', () => {
  it('says how often a bin goes', () => {
    expect(howOften('weekly')).toBe('every week');
    expect(howOften('fortnightly')).toBe('every fortnight');
    expect(howOften('every 28 days')).toBe('every 4 weeks');
    expect(howOften('every 10 days')).toBe('every 10 days');
    expect(howOften('irregular')).toBe('');
  });

  it("lists a council's bins as a sentence, in its own words", () => {
    expect(
      describeBins([
        { type: 'general', name: 'General Waste', frequency: 'weekly' },
        { type: 'recycling', name: 'Recycling', frequency: 'fortnightly' },
        { type: 'organics', name: 'FOGO', frequency: 'irregular' },
      ]),
    ).toBe('general waste every week, recycling every fortnight and FOGO');
  });
});

describe('placeFaq', () => {
  it('asks about the suburb when there is one, and links to the council', () => {
    const faq = placeFaq({
      council: { id: 'qld/gold-coast', name: 'City of Gold Coast', website: 'https://gc.example' },
      suburb: { name: 'Southport' },
    });
    expect(faq.map((item) => item.question)).toContain('When is bin day in Southport?');
    expect(
      faq.find((item) => item.question.startsWith('What about public holidays'))?.answer,
    ).toContain("[City of Gold Coast's website](https://gc.example)");
  });

  it("leaves out the question about bins for a council whose bins aren't known", () => {
    const faq = placeFaq({ council: { id: 'nowhere/test', name: 'Test Council' } });
    expect(faq.map((item) => item.question)).not.toContain(
      'Which bins does Test Council collect in Test?',
    );
    expect(faq[0]?.question).toBe('When is bin day in Test?');
  });
});
