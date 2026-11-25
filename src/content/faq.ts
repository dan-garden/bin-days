import { binsOf, describeBins, listBins } from '../councils/bins.js';
import { shortCouncilName, sourceDescription } from '../councils/names.js';

/** A question and its answer, in the site's Markdown. */
export interface Faq {
  question: string;
  answer: string;
}

interface Place {
  council: {
    id: string;
    name: string;
    website?: string | undefined;
    platform?: string | undefined;
  };
  /** The suburb, on a suburb's page. */
  suburb?: { name: string } | undefined;
}

/**
 * The questions people search for about a council or suburb's bins, answered
 * from what Bin Days knows about it. Add a question here and every council and
 * suburb page gets it.
 */
export function placeFaq({ council, suburb }: Place): Faq[] {
  const where = suburb?.name ?? shortCouncilName(council.name);
  const bins = binsOf(council.id);
  const weekly = bins.filter((bin) => bin.frequency === 'weekly');
  const lessOften = bins.filter((bin) => bin.frequency !== 'weekly');
  const site = council.website ? `[${council.name}'s website](${council.website})` : council.name;
  return [
    {
      question: `When is bin day in ${where}?`,
      answer: `${council.name} collects on different days in different parts of ${where}, so there isn't one bin day for everyone. Type your address at the top of this page to see your day and which bins go out.`,
    },
    ...(bins.length
      ? [
          {
            question: `Which bins does ${council.name} collect in ${where}?`,
            answer: `Most homes have ${describeBins(bins)}. Some properties have different bins, or extra ones on request. Your address shows the bins you have.`,
          },
        ]
      : []),
    {
      question: `Which bins go out this week in ${where}?`,
      answer: [
        weekly.length &&
          `${capitalise(listBins(weekly))} go${weekly.length > 1 ? '' : 'es'} out every week.`,
        lessOften.length &&
          `${capitalise(listBins(lessOften))} ${lessOften.length > 1 ? "aren't" : "isn't"} collected every week, and which week depends on your street.`,
        "Look up your address to see this week's bins and the weeks after.",
      ]
        .filter(Boolean)
        .join(' '),
    },
    {
      question: 'Can I get a reminder the night before?',
      answer: `Yes. Look up your address, then choose **Add to your calendar**. Your calendar shows a year of bin days and updates itself, and can remind you the evening before. [How to set it up](/guides/bin-day-calendar).`,
    },
    {
      question: 'What about public holidays?',
      answer: `Dates marked "est." are worked out from the regular cycle, so a public holiday can move them. Around holidays, check ${site}. [More about public holidays](/guides/public-holidays).`,
    },
    {
      question: 'Where do these dates come from?',
      answer: `From ${sourceDescription(council)}. Bin Days is free and independent: it isn't run by ${council.name}. [How Bin Days works](/about).`,
    },
  ];
}

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
